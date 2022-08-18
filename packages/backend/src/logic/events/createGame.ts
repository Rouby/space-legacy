import cuid from 'cuid';

export function createGame(options: {
  maxPlayers: number;
  name: string;
  creatorId: string;
}) {
  return {
    type: 'createGame' as const,
    version: 1,
    payload: {
      id: cuid(),
      maxPlayers: options.maxPlayers,
      name: options.name,
      creatorId: options.creatorId,
    },
  };
}
