export function constructShip(options: {
  gameId: string;
  systemId: string;
  userId: string;
  shipyardIndex: number;
  shipId: string;
  workNeeded: number;
  materialsNeeded: number;
}) {
  return {
    type: 'constructShip' as const,
    version: 1 as const,
    payload: {
      gameId: options.gameId,
      systemId: options.systemId,
      userId: options.userId,
      shipyardIndex: options.shipyardIndex,
      shipId: options.shipId,
      workNeeded: options.workNeeded,
      materialsNeeded: options.materialsNeeded,
    },
  };
}
