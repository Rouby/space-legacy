export function nextRound(options: { gameId: string }) {
  return {
    type: 'nextRound' as const,
    version: 1 as const,
    payload: {
      gameId: options.gameId,
    },
  };
}
