import type { GameEvent } from '@prisma/client';
import { getDbClient } from '../../util';
import type { AppEvent } from '../events';
import type { Combat } from './Combat';
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
  public combats = [] as Promised<Combat>[];

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

    if (event.type === 'destroyShip' && event.payload.gameId === this.id) {
      this.ships = this.ships.filter(
        (ship) => ship.id !== event.payload.shipId,
      );
    }

    if (event.type === 'engageCombat' && event.payload.gameId === this.id) {
      this.combats.push(proxies.combatProxy(event.payload.id));
    }

    if (event.type === 'endCombat' && event.payload.gameId === this.id) {
      this.combats = this.combats.filter(
        (combat) => combat.id !== event.payload.combatId,
      );
    }
  }
}
