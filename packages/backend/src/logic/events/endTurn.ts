export function endTurn(options: { gameId: string; userId: string }) {
  return {
    type: 'endTurn' as const,
    version: 1 as const,
    payload: {
      gameId: options.gameId,
      userId: options.userId,
    },
  };
}
