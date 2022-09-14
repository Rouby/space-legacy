import cuid from 'cuid';

export function launchShip(options: {
  gameId: string;
  coordinates: { x: number; y: number };
  userId: string;
  designId: string;
  id?: string;
}) {
  return {
    type: 'launchShip' as const,
    version: 1 as const,
    payload: {
      id: options.id ?? cuid(),
      gameId: options.gameId,
      coordinates: options.coordinates,
      userId: options.userId,
      designId: options.designId,
    },
  };
}
