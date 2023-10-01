import cuid from 'cuid';

export function createShipDesign(options: {
  gameId: string;
  userId: string;
  name: string;
  componentIds: string[];
  structuralHealth: number;
  sensorRange: number;
  weapons: { name: string; damage: string; initiative: number }[];
  previousDesignId?: string;
  id?: string;
}) {
  return {
    type: 'createShipDesign' as const,
    version: 1 as const,
    payload: {
      id: options.id ?? cuid(),
      gameId: options.gameId,
      userId: options.userId,
      name: options.name,
      componentIds: options.componentIds,
      structuralHealth: options.structuralHealth,
      sensorRange: options.sensorRange,
      weapons: options.weapons,
      previousDesignId: options.previousDesignId,
    },
  };
}
