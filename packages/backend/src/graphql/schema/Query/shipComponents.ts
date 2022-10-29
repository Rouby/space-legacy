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

    ftlSpeed: Int!
    fuelConsumption: Int!
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
};
