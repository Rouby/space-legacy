import { CombatCardId } from '../combat';

export function playCombatCard(options: {
  gameId: string;
  combatId: string;
  userId: string;
  cardId: CombatCardId;
}) {
  return {
    type: 'playCombatCard' as const,
    version: 1 as const,
    payload: {
      gameId: options.gameId,
      combatId: options.combatId,
      userId: options.userId,
      cardId: options.cardId,
    },
  };
}
