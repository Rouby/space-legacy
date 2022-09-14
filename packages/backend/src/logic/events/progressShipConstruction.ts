export function progressShipConstruction(options: {
  gameId: string;
  systemId: string;
  shipyardIndex: number;
  shipId: string;
  workDone: number;
  materialsDelivered: number;
}) {
  return {
    type: 'progressShipConstruction' as const,
    version: 1 as const,
    payload: {
      gameId: options.gameId,
      systemId: options.systemId,
      shipyardIndex: options.shipyardIndex,
      shipId: options.shipId,
      workDone: options.workDone,
      materialsDelivered: options.materialsDelivered,
    },
  };
}
