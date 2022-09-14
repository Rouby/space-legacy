import cuid from 'cuid';

export function launchShip(options: {
  gameId: string;
  systemId: string;
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
      systemId: options.systemId,
      userId: options.userId,
      designId: options.designId,
    },
  };
}
