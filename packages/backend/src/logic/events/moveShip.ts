export function moveShip(options: {
  gameId: string;
  shipId: string;
  to: { x: number; y: number };
}) {
  return {
    type: 'moveShip' as const,
    version: 1 as const,
    payload: {
      gameId: options.gameId,
      shipId: options.shipId,
      to: options.to,
    },
  };
}
