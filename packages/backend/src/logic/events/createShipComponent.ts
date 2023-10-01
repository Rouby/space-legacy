import cuid from 'cuid';

export function createShipComponent(
  options: {
    gameId: string;
    userId: string;
    name: string;
    crewRequirements: number;
    powerDraw: number;
    structuralStrength: number;
    resourceCosts: number;
    previousComponentId?: string;
    id?: string;
  } & Component,
) {
  return {
    type: 'createShipComponent' as const,
    version: 1 as const,
    payload: {
      id: options.id ?? cuid(),
      ...options,
    },
  };
}

type Component =
  | FtlComponent
  | ThrusterComponent
  | GeneratorComponent
  | WeaponComponent
  | SensorComponent
  | ShieldComponent
  | ArmorComponent
  | AugmentationComponent;

type FtlComponent = {
  type: 'ftl';
  ftlSpeed: number;
  fuelConsumption: number;
};

type ThrusterComponent = {
  type: 'thruster';
  evasion: number;
};

type GeneratorComponent = {
  type: 'generator';
  powerGeneration: number;
};

type WeaponComponent = {
  type: 'weapon';
  weaponDamage: string;
  weaponInitiative: number;
  ammoConsumption: number;
};

type SensorComponent = {
  type: 'sensor';
  sensorRange: number;
};

type ShieldComponent = {
  type: 'shield';
  shieldStrength: number;
  shieldRegeneration: number;
};

type ArmorComponent = {
  type: 'armor';
  armorStrength: number;
};

type AugmentationComponent = {
  type: 'augmentation';
  crewCapacity?: number;
  soldierCapacity?: number;
  cargoCapacity?: number;
  lifeSupport?: number;
};
