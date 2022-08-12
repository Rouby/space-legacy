export function deleteGame(options: { id: string }) {
  return {
    type: 'deleteGame' as const,
    version: 1,
    payload: {
      id: options.id,
    },
  };
}
