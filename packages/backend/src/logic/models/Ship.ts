import type { GameEvent } from '@prisma/client';
import { getDbClient } from '../../util';
import type { AppEvent } from '../events';
import { Promised, proxies } from './proxies';
import type { ShipDesign } from './ShipDesign';
import type { StarSystem } from './StarSystem';

export class Ship {
  readonly kind = 'Ship';

  static async get(id: string) {
    const ship = new Ship(id);

    const events = await (
      await getDbClient()
    ).gameEvent.findMany({
      orderBy: { createdAt: 'asc' },
    });

    events.forEach((event) => {
      ship.applyEvent({
        ...event,
        payload: JSON.parse(event.payload),
      } as Omit<GameEvent, 'payload'> & AppEvent);
    });

    return ship;
  }

  private constructor(public id: string) {}

  public game = proxies.gameProxy('');
  public owner = proxies.userProxy('');
  public design = null as Promised<ShipDesign> | null;
  public name = '';
  public starSystem = null as Promised<StarSystem> | null;
  public coordinates = { x: 0, y: 0 };
  public movingTo = null as { x: number; y: number } | null;

  public async isVisibleTo(userId: string) {
    const visibility = await proxies.visibilityProxy(this.game!.id, userId)
      .$resolve;
    return visibility.checkVisibility(this.coordinates);
  }

  private applyEvent(event: AppEvent) {
    if (event.type === 'launchShip' && event.payload.id === this.id) {
      this.game = proxies.gameProxy(event.payload.gameId);
      this.owner = proxies.userProxy(event.payload.userId);
      this.design = proxies.shipDesignProxy(event.payload.designId);
      this.coordinates = event.payload.coordinates;
      // this.starSystem = proxies.starSystemProxy(event.payload.systemId);
      // this.coordinates = this.starSystem.coordinates
    }

    if (
      event.type === 'issueMoveOrder' &&
      event.payload.subjectId === this.id
    ) {
      if (
        event.payload.to.x === this.coordinates.x &&
        event.payload.to.y === this.coordinates.y
      ) {
        this.movingTo = null;
      } else {
        this.movingTo = event.payload.to;
      }
    }

    if (event.type === 'moveShip' && event.payload.shipId === this.id) {
      this.coordinates = event.payload.to;
      if (
        this.movingTo?.x === this.coordinates.x &&
        this.movingTo?.y === this.coordinates.y
      ) {
        this.movingTo = null;
      }
    }
  }
}

export type PromisedShip = Ship | Promised<Ship>;
