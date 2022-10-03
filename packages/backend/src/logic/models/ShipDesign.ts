import type { GameEvent } from '@prisma/client';
import { getDbClient } from '../../util';
import type { AppEvent } from '../events';

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
  public weapons = [{ name: 'default', damage: '1d6', initiative: 0 }] as {
    name: string;
    damage: string;
    initiative: number;
  }[];
  public structuralHealth = 10;

  private applyEvent(event: AppEvent) {}
}
