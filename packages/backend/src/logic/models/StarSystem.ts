import type { GameEvent } from '@prisma/client';
import { getDbClient, Vector } from '../../util';
import type { AppEvent } from '../events';
import type { Game } from './Game';
import type { Player } from './Player';
import { proxies, type Promised } from './proxies';
import type { Ship } from './Ship';
import type { ShipDesign } from './ShipDesign';

export class StarSystem {
  readonly kind = 'StarSystem';

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

  public game = null as Promised<Game> | null;
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
  public coordinates = new Vector();
  public habitablePlanets = [] as {
    owner?: Promised<Player>;
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
  public shipyards = [] as {
    shipConstructionQueue: {
      id: string;
      design: Promised<ShipDesign>;
      workLeft: number;
      materialsLeft: number;
    }[];
    workLeft: number;
    materialsLeft: number;
    owner: Promised<Player>;
  }[];
  public ships = [] as Promised<Ship>[];

  public async isVisibleTo(userId: string) {
    const visibility = await proxies.visibilityProxy(this.game!.id, userId)
      .$resolve;
    return visibility.checkVisibility(this.coordinates);
  }

  private applyEvent(event: AppEvent) {
    if (event.type === 'createStarSystem' && event.payload.id === this.id) {
      this.game = proxies.gameProxy(event.payload.gameId);
      this.name = event.payload.name;
      this.sunClass = event.payload.sunClass;
      this.coordinates = new Vector(event.payload.coordinates);
      this.habitablePlanets = event.payload.habitablePlanets;
      this.uninhabitableBodies = event.payload.uninhabitableBodies;
    }

    if (event.type === 'colonizePlanet' && event.payload.systemId === this.id) {
      this.habitablePlanets
        .filter((_, idx) => idx === event.payload.planetIndex)
        .forEach((planet) => {
          planet.owner = proxies.playerProxy(
            event.payload.gameId,
            event.payload.userId,
          );
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

    if (
      event.type === 'constructShipyard' &&
      event.payload.systemId === this.id
    ) {
      this.shipyards.push({
        shipConstructionQueue: [],
        workLeft: event.payload.materialsNeeded,
        materialsLeft: event.payload.materialsNeeded,
        owner: proxies.playerProxy(event.payload.gameId, event.payload.userId),
      });
    }

    if (event.type === 'constructShip' && event.payload.systemId === this.id) {
      this.shipyards[event.payload.shipyardIndex].shipConstructionQueue.push({
        id: event.payload.id,
        design: proxies.shipDesignProxy(event.payload.designId),
        workLeft: event.payload.workNeeded,
        materialsLeft: event.payload.materialsNeeded,
      });
    }

    if (
      event.type === 'cancelShipConstruction' &&
      event.payload.systemId === this.id
    ) {
      this.shipyards[event.payload.shipyardIndex].shipConstructionQueue.splice(
        event.payload.queueIndex,
        1,
      );
    }

    if (
      event.type === 'progressShipConstruction' &&
      event.payload.systemId === this.id
    ) {
      const construction = this.shipyards[
        event.payload.shipyardIndex
      ].shipConstructionQueue.find((c) => c.id === event.payload.shipId)!;

      construction.workLeft -= event.payload.workDone;
      construction.materialsLeft -= event.payload.materialsDelivered;
    }

    if (
      event.type === 'launchShip' &&
      event.payload.gameId === this.game?.id &&
      this.coordinates.equals(event.payload.coordinates)
    ) {
      this.ships.push(proxies.shipProxy(event.payload.id));

      this.shipyards.forEach((yard) => {
        const idx = yard.shipConstructionQueue.findIndex(
          (c) => c.id === event.payload.id,
        );
        if (idx >= 0) {
          yard.shipConstructionQueue.splice(idx, 1);
        }
      });
    }

    if (event.type === 'moveShip' && event.payload.gameId === this.game?.id) {
      if (this.coordinates.equals(event.payload.to)) {
        this.ships.push(proxies.shipProxy(event.payload.shipId));
      } else {
        this.ships = this.ships.filter(
          (ship) => ship.id !== event.payload.shipId,
        );
      }
    }
  }
}
