import { ForbiddenError } from '@casl/ability';
import { Player, ShipComponent } from '../../../logic/models';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  interface ShipComponent {
    id: ID!
    name: String!
    powerDraw: Int!
    crewRequirements: Int!
    structuralStrength: Int!
    resourceCosts: Int!
    previousComponent: ShipComponent
  }

  type Query {
    shipComponent(id: ID!, gameId: ID!): ShipComponent
    shipComponents(gameId: ID!): [ShipComponent!]!
  }

  type FTLShipComponent implements ShipComponent {
    id: ID!
    name: String!
    powerDraw: Int!
    crewRequirements: Int!
    structuralStrength: Int!
    resourceCosts: Int!
    previousComponent: ShipComponent

    ftlSpeed: Int!
    fuelConsumption: Int!
  }

  type ThrusterShipComponent implements ShipComponent {
    id: ID!
    name: String!
    powerDraw: Int!
    crewRequirements: Int!
    structuralStrength: Int!
    resourceCosts: Int!
    previousComponent: ShipComponent

    evasion: Int!
  }

  type GeneratorShipComponent implements ShipComponent {
    id: ID!
    name: String!
    powerDraw: Int!
    crewRequirements: Int!
    structuralStrength: Int!
    resourceCosts: Int!
    previousComponent: ShipComponent

    powerGeneration: Int!
  }

  type WeaponShipComponent implements ShipComponent {
    id: ID!
    name: String!
    powerDraw: Int!
    crewRequirements: Int!
    structuralStrength: Int!
    resourceCosts: Int!
    previousComponent: ShipComponent

    weaponDamage: Int!
    weaponInitiative: Int!
    ammoConsumption: Int!
  }

  type SensorShipComponent implements ShipComponent {
    id: ID!
    name: String!
    powerDraw: Int!
    crewRequirements: Int!
    structuralStrength: Int!
    resourceCosts: Int!
    previousComponent: ShipComponent

    sensorRange: Int!
  }

  type ShieldShipComponent implements ShipComponent {
    id: ID!
    name: String!
    powerDraw: Int!
    crewRequirements: Int!
    structuralStrength: Int!
    resourceCosts: Int!
    previousComponent: ShipComponent

    shieldStrength: Int!
    shieldRegeneration: Int!
  }

  type ArmorShipComponent implements ShipComponent {
    id: ID!
    name: String!
    powerDraw: Int!
    crewRequirements: Int!
    structuralStrength: Int!
    resourceCosts: Int!
    previousComponent: ShipComponent

    armorStrength: Int!
  }

  type AugmentationShipComponent implements ShipComponent {
    id: ID!
    name: String!
    powerDraw: Int!
    crewRequirements: Int!
    structuralStrength: Int!
    resourceCosts: Int!
    previousComponent: ShipComponent

    crewCapacity: Int
    soldierCapacity: Int
    cargoCapacity: Int
    lifeSupport: Int
  }
`;

export const resolvers: Resolvers = {
  Query: {
    shipComponent: async (_, { gameId, id }, { get, ability, userId }) => {
      const shipComponent = await get(ShipComponent, id);

      ForbiddenError.from(ability).throwUnlessCan('read', shipComponent);

      return shipComponent;
    },
    shipComponents: async (_, { gameId }, { get, userId }) => {
      const components = (await get(Player, gameId, userId))
        .availableShipComponents;

      return components;
    },
  },
  ShipComponent: {
    __resolveType: async (component) => {
      switch (await component.type) {
        case 'ftl':
          return 'FTLShipComponent' as const;
        case 'thruster':
          return 'ThrusterShipComponent' as const;
        case 'generator':
          return 'GeneratorShipComponent' as const;
        case 'weapon':
          return 'WeaponShipComponent' as const;
        case 'sensor':
          return 'SensorShipComponent' as const;
        case 'shield':
          return 'ShieldShipComponent' as const;
        case 'armor':
          return 'ArmorShipComponent' as const;
        case 'augmentation':
          return 'AugmentationShipComponent' as const;
      }
    },
  },
};
