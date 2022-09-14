export function issueShipOrder(
  options: {
    gameId: string;
    shipId: string;
  } & Orders,
) {
  return {
    type: 'issueShipOrder' as const,
    version: 1 as const,
    payload: {
      ...options,
      gameId: options.gameId,
      shipId: options.shipId,
      order: options.order,
    },
  };
}

type Orders = MoveOrder | PatrolOrder;

interface MoveOrder {
  order: 'move';
  to: { x: number; y: number };
}

interface PatrolOrder {
  order: 'patrol';
  from: { x: number; y: number };
  to: { x: number; y: number };
}
