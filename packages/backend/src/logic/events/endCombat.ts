export function endCombat(options: {
  gameId: string;
  combatId: string;
  winnerUserIds: string[];
}) {
  return {
    type: 'endCombat' as const,
    version: 1 as const,
    payload: {
      gameId: options.gameId,
      combatId: options.combatId,
      winnerUserIds: options.winnerUserIds,
    },
  };
}
