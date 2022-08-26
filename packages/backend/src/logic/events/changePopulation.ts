export function changePopulation(options: {
  gameId: string;
  systemId: string;
  planetIndex: number;
  populationChange: number;
}) {
  return {
    type: 'changePopulation' as const,
    version: 1,
    payload: {
      gameId: options.gameId,
      systemId: options.systemId,
      planetIndex: options.planetIndex,
      populationChange: options.populationChange,
    },
  };
}
