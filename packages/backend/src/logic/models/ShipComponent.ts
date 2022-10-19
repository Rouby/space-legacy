import type { GameEvent } from '@prisma/client';
import { getDbClient } from '../../util';
import type { AppEvent } from '../events';

export class ShipComponent {
  readonly kind = 'ShipComponent';

  static async get(id: string) {
    const component = new ShipComponent(id);

    const events = await (
      await getDbClient()
    ).gameEvent.findMany({
      orderBy: { createdAt: 'asc' },
    });

    events.forEach((event) => {
      component.applyEvent({
        ...event,
        payload: JSON.parse(event.payload),
      } as Omit<GameEvent, 'payload'> & AppEvent);
    });

    return component;
  }

  private constructor(public id: string) {}

  public name = '';

  private applyEvent(event: AppEvent) {}
}
