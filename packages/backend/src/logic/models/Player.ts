import type { AppEvent } from '../events';
import { Base } from './Base';
import { proxies, type Promised } from './proxies';
import type { ShipComponent } from './ShipComponent';
import type { ShipDesign } from './ShipDesign';

export class Player extends Base {
  readonly kind = 'Player';

  public constructor(public gameId: string, public userId: string) {
    super();
  }

  public game = proxies.gameProxy(this.gameId);
  public user = proxies.userProxy(this.userId);
  public turnEnded = false;
  public relationships = {} as { [userId: string]: 'friendly' | 'hostile' };
  public name = 'New Player';
  public availableShipDesigns = [] as Promised<ShipDesign>[];
  public availableShipComponents = [] as Promised<ShipComponent>[];

  protected applyEvent(event: AppEvent) {
    if (
      event.type === 'joinGame' &&
      event.payload.gameId === this.gameId &&
      event.payload.userId !== this.userId
    ) {
      this.relationships[event.payload.userId] = 'hostile';
    }

    if (
      event.type === 'endTurn' &&
      event.payload.gameId === this.gameId &&
      event.payload.userId === this.userId
    ) {
      this.turnEnded = true;
    }

    if (event.type === 'nextRound' && event.payload.gameId === this.gameId) {
      this.turnEnded = false;
    }

    if (
      event.type === 'createShipDesign' &&
      event.payload.gameId === this.gameId &&
      event.payload.userId === this.userId
    ) {
      this.availableShipDesigns.push(proxies.shipDesignProxy(event.payload.id));
    }

    if (
      event.type === 'createShipComponent' &&
      event.payload.gameId === this.gameId &&
      event.payload.userId === this.userId
    ) {
      this.availableShipComponents.push(
        proxies.shipComponentProxy(event.payload.id),
      );
    }
  }
}

export type PromisedPlayer = Player | Promised<Player>;
