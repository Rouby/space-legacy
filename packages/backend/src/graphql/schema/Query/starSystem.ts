import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type StarSystem {
    id: ID!
    name: String!
    habitablePlanets: [Planet!]!
    uninhabitableBodies: [Body!]!
    shipyards: [Shipyard!]!
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
    shipId: ID!
    workLeft: Int!
    materialsLeft: Int!
  }

  type Query {
    starSystem(id: ID!, gameId: ID!): StarSystem
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Query: {
    starSystem: async (_, { gameId, id }, { models, ability }) => {
      // if (ability.cannot('read', 'GamesList')) {
      //   throw new GraphQLYogaError('Unauthorized');
      // }

      return models.StarSystem.get(id);
    },
  },
};
