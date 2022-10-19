import cuid from 'cuid';

export function createShipComponent(options: {
  gameId: string;
  userId: string;
  name: string;
  type: 'engine' | 'weapon' | 'sensor' | 'shield' | 'armor' | 'augmentation';
}) {
  return {
    type: 'createShipComponent' as const,
    version: 1 as const,
    payload: {
      id: cuid(),
      gameId: options.gameId,
      userId: options.userId,
      name: options.name,
    },
  };
}
