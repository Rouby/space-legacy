export function damageShip(options: {
  gameId: string;
  combatId: string;
  shipId: string;
  damage: number;
  rollSeed: string;
  sourceShipId: string;
}) {
  return {
    type: 'damageShip' as const,
    version: 1 as const,
    payload: {
      gameId: options.gameId,
      combatId: options.combatId,
      shipId: options.shipId,
      damage: options.damage,
      rollSeed: options.rollSeed,
      sourceShipId: options.sourceShipId,
    },
  };
}
