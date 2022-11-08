import {
  Model,
  Promised,
  promisedInstance,
  registerModel,
} from '@rouby/event-sourcing';
import type { AppEvent } from '../events';
import type { Combat } from './Combat';
import type { Player } from './Player';
import type { Ship } from './Ship';
import type { StarSystem } from './StarSystem';

export class Game extends Model {
  readonly kind = 'Game';

  public constructor(public id: string) {
    super();
  }

  public name = '';
  public maxPlayers = 0;
  public creator = promisedInstance('User', { id: '' });
  public state = 'NON_EXISTENT' as
    | 'NON_EXISTENT'
    | 'CREATED'
    | 'STARTED'
    | 'ENDED';
  public round = 0;
  public players = [] as Promised<Player>[];
  public starSystems = [] as Promised<StarSystem>[];
  public ships = [] as Promised<Ship>[];
  public combats = [] as Promised<Combat>[];

  protected applyEvent(event: AppEvent) {
    if (event.type === 'createGame' && event.payload.id === this.id) {
      this.state = 'CREATED';
      this.name = event.payload.name;
      this.maxPlayers = event.payload.maxPlayers;
      this.creator = promisedInstance('User', { id: event.payload.creatorId });
      this.round = 1;
    }

    if (event.type === 'deleteGame' && event.payload.id === this.id) {
      this.state = 'NON_EXISTENT';
    }

    if (event.type === 'joinGame' && event.payload.gameId === this.id) {
      this.players.push(
        promisedInstance('Player', {
          gameId: this.id,
          userId: event.payload.userId,
        }),
      );
    }

    if (event.type === 'startGame' && event.payload.gameId === this.id) {
      this.state = 'STARTED';
    }

    if (event.type === 'nextRound' && event.payload.gameId === this.id) {
      this.round = this.round + 1;
    }

    // if (event.type === 'createStarSystem' && event.payload.gameId === this.id) {
    //   this.starSystems.push(proxies.starSystemProxy(event.payload.id));
    // }

    // if (event.type === 'launchShip' && event.payload.gameId === this.id) {
    //   this.ships.push(proxies.shipProxy(event.payload.id));
    // }

    if (event.type === 'destroyShip' && event.payload.gameId === this.id) {
      this.ships = this.ships.filter(
        (ship) => ship.id !== event.payload.shipId,
      );
    }

    // if (event.type === 'engageCombat' && event.payload.gameId === this.id) {
    //   this.combats.push(proxies.combatProxy(event.payload.id));
    // }

    if (event.type === 'endCombat' && event.payload.gameId === this.id) {
      this.combats = this.combats.filter(
        (combat) => combat.id !== event.payload.combatId,
      );
    }
  }
}

declare module '@rouby/event-sourcing' {
  interface RegisteredModels {
    Game: Game;
  }
}

registerModel('Game', Game);
