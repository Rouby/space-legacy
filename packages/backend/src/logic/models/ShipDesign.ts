import type { AppEvent } from '../events';
import { Base } from './Base';
import { Promised, proxies } from './proxies';
import type { ShipComponent } from './ShipComponent';

export class ShipDesign extends Base {
  readonly kind = 'ShipDesign';

  public constructor(public id: string) {
    super();
  }

  public name = '';
  public owner = proxies.playerProxy('', '');
  public weapons = [] as {
    name: string;
    damage: string;
    initiative: number;
  }[];
  public structuralHealth = 0;
  public sensorRange = 0;
  public components = [] as Promised<ShipComponent>[];

  protected applyEvent(event: AppEvent) {
    if (event.type === 'createShipDesign' && event.payload.id === this.id) {
      this.name = event.payload.name;
      this.owner = proxies.playerProxy(
        event.payload.gameId,
        event.payload.userId,
      );
      this.weapons = event.payload.weapons;
      this.structuralHealth = event.payload.structuralHealth;
      this.sensorRange = event.payload.sensorRange;
      this.components = event.payload.componentIds.map((id) =>
        proxies.shipComponentProxy(id),
      );
    }
  }
}
