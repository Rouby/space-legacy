import {
  Model,
  Promised,
  promisedInstance,
  registerModel,
} from '@rouby/event-sourcing';
import type { AppEvent } from '../events';
import type { ShipComponent } from './ShipComponent';
import type { ShipDesign } from './ShipDesign';

export class Player extends Model {
  readonly kind = 'Player';

  public constructor(public gameId: string, public userId: string) {
    super();
  }

  public game = promisedInstance('Game', { id: this.gameId });
  public user = promisedInstance('User', { id: this.userId });
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
      this.availableShipDesigns.push(
        promisedInstance('ShipDesign', { id: event.payload.id }),
      );
    }

    if (
      event.type === 'createShipComponent' &&
      event.payload.gameId === this.gameId &&
      event.payload.userId === this.userId
    ) {
      this.availableShipComponents.push(
        promisedInstance('ShipComponent', { id: event.payload.id }),
      );
    }
  }
}

declare module '@rouby/event-sourcing' {
  interface RegisteredModels {
    Player: Player;
  }
}

registerModel('Player', Player);
