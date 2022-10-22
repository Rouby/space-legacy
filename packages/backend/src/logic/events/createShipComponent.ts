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
  } & Component,
) {
  return {
    type: 'createShipComponent' as const,
    version: 1 as const,
    payload: {
      id: cuid(),
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
  range: number;
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
