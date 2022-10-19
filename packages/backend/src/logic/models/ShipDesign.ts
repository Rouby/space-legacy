import type { GameEvent } from '@prisma/client';
import { getDbClient } from '../../util';
import type { AppEvent } from '../events';
import { Promised, proxies } from './proxies';
import type { ShipComponent } from './ShipComponent';

export class ShipDesign {
  readonly kind = 'ShipDesign';

  static async get(id: string) {
    const design = new ShipDesign(id);

    const events = await (
      await getDbClient()
    ).gameEvent.findMany({
      orderBy: { createdAt: 'asc' },
    });

    events.forEach((event) => {
      design.applyEvent({
        ...event,
        payload: JSON.parse(event.payload),
      } as Omit<GameEvent, 'payload'> & AppEvent);
    });

    return design;
  }

  private constructor(public id: string) {}

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

  private applyEvent(event: AppEvent) {
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
