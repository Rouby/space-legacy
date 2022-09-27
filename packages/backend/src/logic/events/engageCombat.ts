import cuid from 'cuid';

export type CombatCardId =
  // Offensive
  | 'Attack'
  | 'Assault'
  | 'Shock'
  | 'Breakthrough'
  | 'Blitz'
  | 'MassCharge'
  | 'InfiltrationAssault'
  | 'WellPlannedAttack'
  | 'RelentlessAssault'
  | 'UnexpectedThrust'
  | 'SuppressiveBarrage'
  // Defensive
  | 'Defend'
  | 'CounterAttack'
  | 'Delay'
  | 'TacticalWithdrawal'
  | 'Ambush'
  | 'ElasticDefense'
  | 'BackhandBlow'
  | 'GuerrillaTactics'
  | 'OverwhelmingFire'
  // Effects
  | 'Rally'
  | 'EmergencyRepairs'
  | 'Reorganize'
  | 'DirectHit'
  | 'Disable'
  | 'FlankSpeed'
  | 'LuckyShot'
  | 'ManeuveringJets'
  | 'ShieldsHolding'
  | 'SignalJamming'
  | 'SkilledRetreat';

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
