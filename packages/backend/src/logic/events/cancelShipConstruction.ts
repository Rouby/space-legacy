export function cancelShipConstruction(options: {
  gameId: string;
  systemId: string;
  shipyardIndex: number;
  queueIndex: number;
}) {
  return {
    type: 'cancelShipConstruction' as const,
    version: 1 as const,
    payload: {
      gameId: options.gameId,
      systemId: options.systemId,
      shipyardIndex: options.shipyardIndex,
      queueIndex: options.queueIndex,
    },
  };
}
