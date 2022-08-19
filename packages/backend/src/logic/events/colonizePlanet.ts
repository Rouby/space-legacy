export function colonizePlanet(options: {
  gameId: string;
  systemId: string;
  planetIndex: number;
  userId: string;
}) {
  return {
    type: 'colonizePlanet' as const,
    version: 1,
    payload: {
      gameId: options.gameId,
      systemId: options.systemId,
      planetIndex: options.planetIndex,
      userId: options.userId,
    },
  };
}
