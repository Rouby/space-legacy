import cuid from 'cuid';

export function constructShip(options: {
  gameId: string;
  systemId: string;
  userId: string;
  shipyardIndex: number;
  designId: string;
  workNeeded: number;
  materialsNeeded: number;
}) {
  return {
    type: 'constructShip' as const,
    version: 1 as const,
    payload: {
      id: cuid(),
      gameId: options.gameId,
      systemId: options.systemId,
      userId: options.userId,
      shipyardIndex: options.shipyardIndex,
      designId: options.designId,
      workNeeded: options.workNeeded,
      materialsNeeded: options.materialsNeeded,
    },
  };
}
