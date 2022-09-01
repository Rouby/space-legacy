export function constructShipyard(options: {
  gameId: string;
  systemId: string;
  userId: string;
  workNeeded: number;
  materialsNeeded: number;
}) {
  return {
    type: 'constructShipyard' as const,
    version: 1 as const,
    payload: {
      gameId: options.gameId,
      systemId: options.systemId,
      userId: options.userId,
      workNeeded: options.workNeeded,
      materialsNeeded: options.materialsNeeded,
    },
  };
}
