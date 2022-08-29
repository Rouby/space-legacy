export function joinGame(options: { gameId: string; userId: string }) {
  return {
    type: 'joinGame' as const,
    version: 1 as const,
    payload: {
      gameId: options.gameId,
      userId: options.userId,
    },
  };
}
