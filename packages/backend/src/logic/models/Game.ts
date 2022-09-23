import type { GameEvent } from '@prisma/client';
import { getDbClient } from '../../util';
import type { AppEvent } from '../events';
import type { Fleet } from './Fleet';
import type { Player } from './Player';
import { Promised, proxies } from './proxies';
import type { Ship } from './Ship';
import type { StarSystem } from './StarSystem';

export class Game {
  readonly kind = 'Game';

  static async get(id: string) {
    const game = new Game(id);

    const events = await (
      await getDbClient()
    ).gameEvent.findMany({
      orderBy: { createdAt: 'asc' },
    });

    events.forEach((event) => {
      game.applyEvent({
        ...event,
        payload: JSON.parse(event.payload),
      } as Omit<GameEvent, 'payload'> & AppEvent);
    });

    return game;
  }

  constructor(public id: string) {}

  public name = '';
  public maxPlayers = 0;
  public creator = proxies.userProxy('');
  public state = 'CREATED' as 'CREATED' | 'STARTED' | 'ENDED';
  public round = 0;
  public players = [] as Promised<Player>[];
  public starSystems = [] as Promised<StarSystem>[];
  public ships = [] as Promised<Ship>[];
  public fleets = [] as Promised<Fleet>[];

  public async getActiveCombats() {
    const shipsByPosition = await Promise.all(
      this.ships.map((ship) => ship.$resolve),
    ).then((ships) =>
      ships.reduce((acc, ship) => {
        // TODO fix position-based lookup, floating point errors
        const key = `${Math.round(ship.coordinates.x * 100) / 100},${
          Math.round(ship.coordinates.y * 100) / 100
        }`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(ship);
        return acc;
      }, {} as { [key: string]: Ship[] }),
    );
    const fights = await Promise.all(
      Object.entries(shipsByPosition)
        .filter(([, ships]) => ships.length > 1)
        .map(async ([position, ships]) => {
          const shipsByUser = ships.reduce((acc, ship) => {
            if (!acc[ship.owner.userId]) {
              acc[ship.owner.userId] = [];
            }
            acc[ship.owner.userId].push(ship);
            return acc;
          }, {} as { [userId: string]: Ship[] });
          const userIds = Object.keys(shipsByUser);

          const coordinates = position.split(',').reduce(
            (acc, val, idx) => {
              if (idx === 0) acc.x = +val;
              if (idx === 1) acc.y = +val;
              return acc;
            },
            { x: 0, y: 0 },
          );
          const players = await Promise.all(
            this.players.map((player) => player.$resolve),
          );
          const fights = userIds
            .map((userId) => {
              const relationships = players.find(
                (p) => p.userId === userId,
              )?.relationships;
              return {
                coordinates,
                userId,
                ships: shipsByUser[userId],
                hostiles: userIds
                  .filter(
                    (otherUserId) => relationships?.[otherUserId] === 'hostile',
                  )
                  .map((otherUserId) => ({
                    userId: otherUserId,
                    ships: shipsByUser[otherUserId],
                  })),
              };
            })
            .filter(({ hostiles }) => hostiles.length > 0);

          return fights;
        }),
    ).then((arr) => arr.flat());

    return fights;
  }

  private applyEvent(event: AppEvent) {
    if (event.type === 'createGame' && event.payload.id === this.id) {
      this.name = event.payload.name;
      this.maxPlayers = event.payload.maxPlayers;
      this.creator = proxies.userProxy(event.payload.creatorId);
      this.round = 1;
    }

    if (event.type === 'joinGame' && event.payload.gameId === this.id) {
      this.players.push(proxies.playerProxy(this.id, event.payload.userId));
    }

    if (event.type === 'startGame' && event.payload.gameId === this.id) {
      this.state = 'STARTED';
    }

    if (event.type === 'nextRound' && event.payload.gameId === this.id) {
      this.round = this.round + 1;
    }

    if (event.type === 'createStarSystem' && event.payload.gameId === this.id) {
      this.starSystems.push(proxies.starSystemProxy(event.payload.id));
    }

    if (event.type === 'launchShip' && event.payload.gameId === this.id) {
      this.ships.push(proxies.shipProxy(event.payload.id));
    }
  }
}
