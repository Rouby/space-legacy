import { CombatCardId } from '../combat';

export function restoreCombatDeck(options: {
  gameId: string;
  combatId: string;
  userId: string;
  cardIdsInDeck: CombatCardId[];
}) {
  return {
    type: 'restoreCombatDeck' as const,
    version: 1 as const,
    payload: {
      gameId: options.gameId,
      combatId: options.combatId,
      userId: options.userId,
      cardIdsInDeck: options.cardIdsInDeck,
    },
  };
}
