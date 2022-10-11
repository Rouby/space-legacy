import { CombatCardId } from '../combat';

export function drawCombatCard(options: {
  gameId: string;
  combatId: string;
  userId: string;
  cardId: CombatCardId;
}) {
  return {
    type: 'drawCombatCard' as const,
    version: 1 as const,
    payload: {
      gameId: options.gameId,
      combatId: options.combatId,
      userId: options.userId,
      cardId: options.cardId,
    },
  };
}
