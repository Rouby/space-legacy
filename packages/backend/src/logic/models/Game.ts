import type { AppEvent } from '../events';
import { Base } from './Base';
import type { Combat } from './Combat';
import type { Fleet } from './Fleet';
import type { Player } from './Player';
import { Promised, proxies } from './proxies';
import type { Ship } from './Ship';
import type { StarSystem } from './StarSystem';

export class Game extends Base {
  readonly kind = 'Game';

  public constructor(public id: string) {
    super();
  }

  public name = '';
  public maxPlayers = 0;
  public creator = proxies.userProxy('');
  public state = 'NON_EXISTENT' as
    | 'NON_EXISTENT'
    | 'CREATED'
    | 'STARTED'
    | 'ENDED';
  public round = 0;
  public players = [] as Promised<Player>[];
  public starSystems = [] as Promised<StarSystem>[];
  public ships = [] as Promised<Ship>[];
  public fleets = [] as Promised<Fleet>[];
  public combats = [] as Promised<Combat>[];

  protected applyEvent(event: AppEvent) {
    if (event.type === 'createGame' && event.payload.id === this.id) {
      this.state = 'CREATED';
      this.name = event.payload.name;
      this.maxPlayers = event.payload.maxPlayers;
      this.creator = proxies.userProxy(event.payload.creatorId);
      this.round = 1;
    }

    if (event.type === 'deleteGame' && event.payload.id === this.id) {
      this.state = 'NON_EXISTENT';
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
