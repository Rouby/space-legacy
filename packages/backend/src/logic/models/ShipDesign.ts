import {
  Model,
  Promised,
  promisedInstance,
  registerModel,
} from '@rouby/event-sourcing';
import type { AppEvent } from '../events';
import type { ShipComponent } from './ShipComponent';

export class ShipDesign extends Model {
  readonly kind = 'ShipDesign';

  public constructor(public id: string) {
    super();
  }

  public name = '';
  public owner = promisedInstance('Player', { gameId: '', userId: '' });
  public weapons = [] as {
    name: string;
    damage: string;
    initiative: number;
  }[];
  public structuralHealth = 0;
  public sensorRange = 0;
  public components = [] as Promised<ShipComponent>[];

  get ftlSpeed() {
    return Promise.resolve().then(async () => {
      const components = await this.components.$resolveAll;
      return components.reduce((acc, component) => acc + component.ftlSpeed, 0);
    });
  }

  protected applyEvent(event: AppEvent) {
    if (event.type === 'createShipDesign' && event.payload.id === this.id) {
      this.name = event.payload.name;
      this.owner = promisedInstance('Player', {
        gameId: event.payload.gameId,
        userId: event.payload.userId,
      });
      this.weapons = event.payload.weapons;
      this.structuralHealth = event.payload.structuralHealth;
      this.sensorRange = event.payload.sensorRange;
      this.components = event.payload.componentIds.map((id) =>
        promisedInstance('ShipComponent', { id }),
      );
    }
  }
}

declare module '@rouby/event-sourcing' {
  interface RegisteredModels {
    ShipDesign: ShipDesign;
  }
}

registerModel('ShipDesign', ShipDesign);
