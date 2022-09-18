import type { GameEvent } from '@prisma/client';
import { getDbClient } from '../../util';
import type { AppEvent } from '../events';
import { Promised, proxies } from './proxies';
import type { Ship } from './Ship';
import type { StarSystem } from './StarSystem';

export class Visibility {
  readonly kind = 'Visibility';

  static async get(gameId: string, userId: string) {
    const visibility = new Visibility(gameId, userId);

    const events = await (
      await getDbClient()
    ).gameEvent.findMany({
      orderBy: { createdAt: 'asc' },
    });

    events.forEach((event) => {
      visibility.applyEvent({
        ...event,
        payload: JSON.parse(event.payload),
      } as Omit<GameEvent, 'payload'> & AppEvent);
    });

    return visibility;
  }

  constructor(public gameId: string, public userId: string) {}

  public game = proxies.gameProxy(this.gameId);
  public user = proxies.userProxy(this.userId);

  public starSystems = [] as Promised<StarSystem>[];
  public ships = [] as Promised<Ship>[];

  public async checkVisibility(coordinates: { x: number; y: number }) {
    for (const system of this.starSystems) {
      const coords = await system.coordinates;
      const distance = Math.sqrt(
        Math.pow(coords.x - coordinates.x, 2) +
          Math.pow(coords.y - coordinates.y, 2),
      );

      if (distance <= 100) {
        return true;
      }
    }

    for (const ship of this.ships) {
      const coords = await ship.coordinates;
      const distance = Math.sqrt(
        Math.pow(coords.x - coordinates.x, 2) +
          Math.pow(coords.y - coordinates.y, 2),
      );

      if (distance <= 50) {
        return true;
      }
    }

    return false;
  }

  private applyEvent(event: AppEvent) {
    if (
      event.type === 'colonizePlanet' &&
      event.payload.gameId === this.game.id &&
      event.payload.userId === this.user.id
    ) {
      if (!this.starSystems.some((s) => s.id === event.payload.systemId)) {
        this.starSystems.push(proxies.starSystemProxy(event.payload.systemId));
      }
    }

    if (
      event.type === 'launchShip' &&
      event.payload.gameId === this.game.id &&
      event.payload.userId === this.user.id
    ) {
      this.ships.push(proxies.shipProxy(event.payload.id));
    }
  }
}
