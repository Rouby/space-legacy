import { ForbiddenError } from '@casl/ability';
import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type StarSystem {
    id: ID!
    name: String!
    coordinates: Coordinates!
    habitablePlanets: [Planet!]!
    uninhabitableBodies: [Body!]!
    shipyards: [Shipyard!]!
    ships: [Ship!]!
  }

  type Planet {
    name: String
    orbit: Float!
    size: Int!
    type: String!
    owner: User
    population: Int
  }

  type Body {
    orbit: Float!
    size: Int!
    type: String!
  }

  type Shipyard {
    shipConstructionQueue: [ShipConstruction!]!
    workLeft: Int!
    materialsLeft: Int!
  }

  type ShipConstruction {
    design: ShipDesign!
    workLeft: Int!
    materialsLeft: Int!
  }

  type ShipDesign {
    id: ID!
  }

  type Ship {
    id: ID!
    coordinates: Coordinates!
    movingTo: Coordinates
  }

  type Query {
    starSystem(id: ID!, gameId: ID!): StarSystem
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Query: {
    starSystem: async (_, { gameId, id }, { models, ability }) => {
      const starSystem = await models.StarSystem.get(id);

      ForbiddenError.from(ability).throwUnlessCan('view', starSystem);

      return starSystem;
    },
  },
};
