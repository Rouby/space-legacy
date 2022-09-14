export function issueMoveOrder(options: {
  gameId: string;
  subjectId: string;
  to: { x: number; y: number };
}) {
  return {
    type: 'issueMoveOrder' as const,
    version: 1 as const,
    payload: {
      gameId: options.gameId,
      subjectId: options.subjectId,
      to: options.to,
    },
  };
}
