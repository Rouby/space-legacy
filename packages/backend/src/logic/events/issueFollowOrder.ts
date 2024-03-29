export function issueFollowOrder(options: {
  gameId: string;
  subjectId: string;
  targetId: string;
  usePredictiveRoute: boolean;
}) {
  return {
    type: 'issueFollowOrder' as const,
    version: 1 as const,
    payload: {
      gameId: options.gameId,
      subjectId: options.subjectId,
      targetId: options.targetId,
      usePredictiveRoute: options.usePredictiveRoute,
    },
  };
}
