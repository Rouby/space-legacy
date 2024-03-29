export function destroyShip(options: {
  gameId: string;
  combatId: string;
  shipId: string;
  userId: string;
  destroyedByShipId: string;
}) {
  return {
    type: 'destroyShip' as const,
    version: 1 as const,
    payload: {
      gameId: options.gameId,
      combatId: options.combatId,
      shipId: options.shipId,
      userId: options.userId,
      destroyedByShipId: options.destroyedByShipId,
    },
  };
}
