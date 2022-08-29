import type { GameEvent } from '@prisma/client';
import { getDbClient } from '../../util';
import type { AppEvent } from '../events';
import { proxies } from './proxies';

export class StarSystem {
  static get modelName() {
    return 'StarSystem';
  }

  static async get(id: string) {
    const starSystem = new StarSystem(id);

    const events = await (
      await getDbClient()
    ).gameEvent.findMany({
      orderBy: { createdAt: 'asc' },
    });

    events.forEach((event) => {
      starSystem.applyEvent({
        ...event,
        payload: JSON.parse(event.payload),
      } as Omit<GameEvent, 'payload'> & AppEvent);
    });

    return starSystem;
  }

  private constructor(public id: string) {}

  public name = '';
  public sunClass:
    | 'O'
    | 'B'
    | 'A'
    | 'F'
    | 'G'
    | 'K'
    | 'M'
    | 'neutron'
    | 'pulsar'
    | 'blackhole' = 'A';
  public coordinates = { x: 0, y: 0 };
  public habitablePlanets = [] as {
    owner?: ReturnType<typeof proxies.userProxy>;
    population?: number;
    orbit: number;
    size: number;
    type:
      | 'arid'
      | 'desert'
      | 'savanna'
      | 'alpine'
      | 'arctic'
      | 'tundra'
      | 'continental'
      | 'ocean'
      | 'tropical';
  }[];
  public uninhabitableBodies = [] as {
    orbit: number;
    size: number;
    type:
      | 'asteroids'
      | 'gas'
      | 'barren'
      | 'broken'
      | 'frozen'
      | 'molten'
      | 'toxic';
  }[];

  private applyEvent(event: AppEvent) {
    if (event.type === 'createStarSystem' && event.payload.id === this.id) {
      this.name = event.payload.name;
      this.sunClass = event.payload.sunClass;
      this.coordinates = event.payload.coordinates;
      this.habitablePlanets = event.payload.habitablePlanets;
      this.uninhabitableBodies = event.payload.uninhabitableBodies;
    }

    if (event.type === 'colonizePlanet' && event.payload.systemId === this.id) {
      this.habitablePlanets
        .filter((_, idx) => idx === event.payload.planetIndex)
        .forEach((planet) => {
          planet.owner = proxies.userProxy(event.payload.userId);
          planet.population = 1000;
        });
    }

    if (
      event.type === 'changePopulation' &&
      event.payload.systemId === this.id
    ) {
      this.habitablePlanets
        .filter((_, idx) => idx === event.payload.planetIndex)
        .forEach((planet) => {
          if (planet.population) {
            planet.population =
              planet.population + event.payload.populationChange;
          }
        });
    }
  }
}
