export function nextCombatRound(options: { gameId: string; combatId: string }) {
  return {
    type: 'nextCombatRound' as const,
    version: 1 as const,
    payload: {
      gameId: options.gameId,
      combatId: options.combatId,
    },
  };
}
