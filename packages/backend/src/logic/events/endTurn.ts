export function endTurn() {
  return {
    type: 'endTurn' as const,
    version: 1,
  };
}
