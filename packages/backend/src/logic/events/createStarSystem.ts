import cuid from 'cuid';

export function createStarSystem(options: {
  gameId: string;
  name: string;
  coordinates: {
    x: number;
    y: number;
  };
  habitablePlanets: {
    name: string;
    size: number;
    type: 'continental' | 'oceanic' | 'dessert';
  }[];
}) {
  return {
    type: 'createStarSystem' as const,
    version: 1,
    payload: {
      id: cuid(),
      gameId: options.gameId,
      name: options.name,
      coordinates: options.coordinates,
      habitablePlanets: options.habitablePlanets,
    },
  };
}
