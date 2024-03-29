import {
  Model,
  Promised,
  promisedInstance,
  registerModel,
} from '@rouby/event-sourcing';
import type { AppEvent } from '../events';
import type { Ship } from './Ship';
import type { StarSystem } from './StarSystem';

export class Visibility extends Model {
  readonly kind = 'Visibility';

  public constructor(public gameId: string, public userId: string) {
    super();
  }

  public game = promisedInstance('Game', { id: this.gameId });
  public user = promisedInstance('User', { id: this.userId });

  public starSystems = [] as Promised<StarSystem>[];
  public ships = [] as Promised<Ship>[];

  async ranges() {
    const starSystems = await this.starSystems.$resolveAll;
    const ships = await this.ships.$resolveAll.then((ship) =>
      Promise.all(
        ship.map(async (ship) => ({
          ...ship,
          design: await ship.design.$resolve,
        })),
      ),
    );

    return [
      ...starSystems.map((system) => ({
        coordinates: system.coordinates,
        range: system.userSensorRange[this.user.id] || 0,
      })),
      ...ships.map((ship) => ({
        coordinates: ship.coordinates,
        range: ship.design.sensorRange,
      })),
    ];
  }

  public async checkVisibility(coordinates: { x: number; y: number }) {
    for (const system of this.starSystems) {
      const coords = await system.coordinates;
      const distance = coords.subtract(coordinates).magnitude();

      if (distance <= 100) {
        return true;
      }
    }

    for (const ship of this.ships) {
      const coords = await ship.coordinates;
      const distance = coords.subtract(coordinates).magnitude();

      if (distance <= 50) {
        return true;
      }
    }

    return false;
  }

  protected applyEvent(event: AppEvent) {
    if (
      event.type === 'colonizePlanet' &&
      event.payload.gameId === this.game.id &&
      event.payload.userId === this.user.id
    ) {
      if (!this.starSystems.some((s) => s.id === event.payload.systemId)) {
        this.starSystems.push(
          promisedInstance('StarSystem', { id: event.payload.systemId }),
        );
      }
    }

    if (
      event.type === 'launchShip' &&
      event.payload.gameId === this.game.id &&
      event.payload.userId === this.user.id
    ) {
      this.ships.push(promisedInstance('Ship', { id: event.payload.id }));
    }

    if (
      event.type === 'destroyShip' &&
      event.payload.gameId === this.game.id &&
      event.payload.userId === this.user.id
    ) {
      this.ships = this.ships.filter((s) => s.id !== event.payload.shipId);
    }
  }
}

declare module '@rouby/event-sourcing' {
  interface RegisteredModels {
    Visibility: Visibility;
  }
}

registerModel('Visibility', Visibility);
