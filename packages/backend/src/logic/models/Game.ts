import type { GameEvent } from '@prisma/client';
import { getDbClient } from '../../util';
import type { AppEvent } from '../events';
import type { Fleet } from './Fleet';
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
  public players = [] as { id: string; turnEnded: boolean }[];
  public starSystems = [] as Promised<StarSystem>[];
  public ships = [] as Promised<Ship>[];
  public fleets = [] as Promised<Fleet>[];

  private applyEvent(event: AppEvent) {
    if (event.type === 'createGame' && event.payload.id === this.id) {
      this.name = event.payload.name;
      this.maxPlayers = event.payload.maxPlayers;
      this.creator = proxies.userProxy(event.payload.creatorId);
      this.round = 1;
    }

    if (event.type === 'joinGame' && event.payload.gameId === this.id) {
      this.players.push({ id: event.payload.userId, turnEnded: false });
    }

    if (event.type === 'startGame' && event.payload.gameId === this.id) {
      this.state = 'STARTED';
    }

    if (event.type === 'endTurn' && event.payload.gameId === this.id) {
      this.players
        .filter((player) => player.id === event.payload.userId)
        .forEach((player) => {
          player.turnEnded = true;
        });
    }

    if (event.type === 'nextRound' && event.payload.gameId === this.id) {
      this.players.forEach((player) => {
        player.turnEnded = false;
      });
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
