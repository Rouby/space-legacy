import cuid from 'cuid';

export function progressFleetMuster(options: {
  gameId: string;
  systemId: string;
  fleetId: string;
  workDone: number;
  materialsProvided: number;
}) {
  return {
    type: 'progressFleetMuster' as const,
    version: 1 as const,
    payload: {
      id: cuid(),
      gameId: options.gameId,
      systemId: options.systemId,
      fleetId: options.fleetId,
      workDone: options.workDone,
      materialsProvided: options.materialsProvided,
    },
  };
}
