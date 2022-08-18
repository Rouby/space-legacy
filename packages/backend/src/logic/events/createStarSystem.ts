import cuid from 'cuid';

export function createStarSystem(options: {
  name: string;
  coordinates: { x: number; y: number };
}) {
  return {
    type: 'createStarSystem' as const,
    version: 1,
    payload: {
      id: cuid(),
      name: options.name,
      coordinates: options.coordinates,
    },
  };
}
