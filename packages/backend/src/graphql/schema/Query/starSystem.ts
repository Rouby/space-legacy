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

  type Query {
    starSystem(id: ID!, gameId: ID!): StarSystem
  }
`;

export const resolvers: Resolvers = {
  Query: {
    starSystem: async (_, { gameId, id }, { models, ability, userId }) => {
      const starSystem = await models.StarSystem.get(id);

      if (!starSystem.isVisibleTo(userId)) {
        return null;
      }

      return starSystem;
    },
  },
};
