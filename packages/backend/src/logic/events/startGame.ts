export function startGame(options: { gameId: string }) {
  return {
    type: 'startGame' as const,
    version: 1 as const,
    payload: {
      gameId: options.gameId,
    },
  };
}
