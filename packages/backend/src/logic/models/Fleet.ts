import type { GameEvent } from '@prisma/client';
import { getDbClient } from '../../util';
import type { AppEvent } from '../events';
import { proxies } from './proxies';

export class Fleet {
  static get modelName() {
    return 'Fleet';
  }

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
  public starSystem = null as ReturnType<typeof proxies.starSystemProxy> | null;
  public coordinates = { x: 0, y: 0 };
  public composition = {
    squadrons: [] as {
      shipId: string;
      quantity: number;
    }[],
  };
  public mustering = {
    squadrons: [] as {
      shipId: string;
      quantity: number;
      workLeft: number;
      materialNeeded: number;
    }[],
  };

  private applyEvent(event: AppEvent) {
    if (event.type === 'musterFleet' && event.payload.id === this.id) {
      if (event.version === 1) {
        // legacy
        this.owner = proxies.userProxy(event.payload.userId);
        this.name = event.payload.name;
        this.starSystem = proxies.starSystemProxy(event.payload.systemId);
        this.mustering = event.payload.composition;
      } else {
        this.owner = proxies.userProxy(event.payload.userId);
        this.name = event.payload.name;
        this.coordinates = event.payload.coordinates;
        this.starSystem = proxies.starSystemProxy(event.payload.systemId);
        this.mustering = event.payload.composition;
      }
    }
    if (
      event.type === 'progressFleetMuster' &&
      event.payload.fleetId === this.id
    ) {
      let { workDone } = event.payload;
      while (workDone > 0) {
        workDone -= this.mustering.squadrons[0].workLeft;
        if (workDone >= 0) {
          const { shipId, quantity } = this.mustering.squadrons.shift()!;
          let squadron = this.composition.squadrons.find(
            (squadron) => squadron.shipId === shipId,
          );
          if (!squadron) {
            this.composition.squadrons.push(
              (squadron = { shipId, quantity: 0 }),
            );
          }
          squadron.quantity += quantity;
        } else {
          this.mustering.squadrons[0].workLeft = Math.abs(workDone);
        }
      }
    }
  }
}
