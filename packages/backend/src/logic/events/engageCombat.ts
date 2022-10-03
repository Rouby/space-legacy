import cuid from 'cuid';
import { CombatCardId } from '../combat';

export function engageCombat(options: {
  gameId: string;
  coordinates: { x: number; y: number };
  parties: {
    userId: string;
    shipIds: string[];
    cardIdsInHand: CombatCardId[];
    cardIdsInDeck: CombatCardId[];
    versus: {
      userId: string;
      shipIds: string[];
    }[];
  }[];
}) {
  return {
    type: 'engageCombat' as const,
    version: 1 as const,
    payload: {
      id: cuid(),
      gameId: options.gameId,
      coordinates: options.coordinates,
      parties: options.parties,
    },
  };
}
