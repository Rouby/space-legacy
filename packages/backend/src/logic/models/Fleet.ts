import type { GameEvent } from '@prisma/client';
import { getDbClient } from '../../util';
import type { AppEvent } from '../events';
import { Promised, proxies } from './proxies';
import type { StarSystem } from './StarSystem';

export class Fleet {
  readonly kind = 'Fleet';

  static async get(id: string) {
    const fleet = new Fleet(id);

    const events = await (
      await getDbClient()
    ).gameEvent.findMany({
      orderBy: { createdAt: 'asc' },
    });

    events.forEach((event) => {
      fleet.applyEvent({
        ...event,
        payload: JSON.parse(event.payload),
      } as Omit<GameEvent, 'payload'> & AppEvent);
    });

    return fleet;
  }

  private constructor(public id: string) {}

  public owner = proxies.userProxy('');
  public name = '';
  public starSystem = null as Promised<StarSystem> | null;
  public coordinates = { x: 0, y: 0 };
  public ships = [] as {
    shipId: string;
  }[];

  private applyEvent(event: AppEvent) {}
}
