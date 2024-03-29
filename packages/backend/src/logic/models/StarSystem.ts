import {
  Model,
  Promised,
  promisedInstance,
  registerModel,
} from '@rouby/event-sourcing';
import { Vector } from '../../util';
import type { AppEvent } from '../events';
import type { Game } from './Game';
import type { Player } from './Player';
import type { Ship } from './Ship';
import type { ShipDesign } from './ShipDesign';

export class StarSystem extends Model {
  readonly kind = 'StarSystem';

  public constructor(public id: string) {
    super();
  }

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
  public userSensorRange = {} as { [userId: string]: number };

  public async isVisibleTo(userId: string) {
    const visibility = await promisedInstance('Visibility', {
      gameId: this.game!.id,
      userId,
    }).$resolve;
    return visibility.checkVisibility(this.coordinates);
  }

  protected applyEvent(event: AppEvent) {
    if (event.type === 'createStarSystem' && event.payload.id === this.id) {
      this.game = promisedInstance('Game', { id: event.payload.gameId });
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
          planet.owner = promisedInstance('Player', {
            gameId: event.payload.gameId,
            userId: event.payload.userId,
          });
          planet.population = 1000;

          this.userSensorRange[event.payload.userId] = Math.max(
            this.userSensorRange[event.payload.userId] ?? 0,
            15,
          );
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
        owner: promisedInstance('Player', {
          gameId: event.payload.gameId,
          userId: event.payload.userId,
        }),
      });

      this.userSensorRange[event.payload.userId] = Math.max(
        this.userSensorRange[event.payload.userId] ?? 0,
        100,
      );
    }

    if (event.type === 'constructShip' && event.payload.systemId === this.id) {
      this.shipyards[event.payload.shipyardIndex].shipConstructionQueue.push({
        id: event.payload.id,
        design: promisedInstance('ShipDesign', { id: event.payload.designId }),
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
      this.ships.push(promisedInstance('Ship', { id: event.payload.id }));

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
        this.ships.push(promisedInstance('Ship', { id: event.payload.shipId }));
      } else {
        this.ships = this.ships.filter(
          (ship) => ship.id !== event.payload.shipId,
        );
      }
    }
  }
}

declare module '@rouby/event-sourcing' {
  interface RegisteredModels {
    StarSystem: StarSystem;
  }
}

registerModel('StarSystem', StarSystem);
