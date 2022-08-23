import cuid from 'cuid';

export function createStarSystem(options: {
  gameId: string;
  name: string;
  sunClass:
    | 'O'
    | 'B'
    | 'A'
    | 'F'
    | 'G'
    | 'K'
    | 'M'
    | 'neutron'
    | 'pulsar'
    | 'blackhole';
  coordinates: {
    x: number;
    y: number;
  };
  habitablePlanets: {
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
  uninhabitableBodies: {
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
}) {
  return {
    type: 'createStarSystem' as const,
    version: 1,
    payload: {
      id: cuid(),
      gameId: options.gameId,
      name: options.name,
      sunClass: options.sunClass,
      coordinates: options.coordinates,
      habitablePlanets: options.habitablePlanets,
      uninhabitableBodies: options.uninhabitableBodies,
    },
  };
}
