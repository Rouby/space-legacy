import cuid from 'cuid';

export function musterFleet(options: {
  gameId: string;
  systemId: string;
  userId: string;
  name: string;
  coordinates: { x: number; y: number };
  composition: {
    squadrons: {
      shipId: string;
      quantity: number;
      workLeft: number;
      materialNeeded: number;
    }[];
  };
}) {
  return {
    type: 'musterFleet' as const,
    version: 2 as const,
    payload: {
      id: cuid(),
      gameId: options.gameId,
      systemId: options.systemId,
      userId: options.userId,
      name: options.name,
      coordinates: options.coordinates,
      composition: options.composition,
    },
  };
}

export function musterFleetV1(options: {
  gameId: string;
  systemId: string;
  userId: string;
  name: string;
  composition: {
    squadrons: {
      shipId: string;
      quantity: number;
      workLeft: number;
      materialNeeded: number;
    }[];
  };
}) {
  return {
    type: 'musterFleet' as const,
    version: 1 as const,
    payload: {
      id: cuid(),
      gameId: options.gameId,
      systemId: options.systemId,
      userId: options.userId,
      name: options.name,
      composition: options.composition,
    },
  };
}
