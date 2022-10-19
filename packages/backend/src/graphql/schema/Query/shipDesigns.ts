import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type ShipDesign {
    id: ID!
    name: String!
    structuralHealth: Int!
    owner: Player!
  }

  type Query {
    shipDesigns(gameId: ID!): [ShipDesign!]!
  }
`;

export const resolvers: Resolvers = {
  Query: {
    shipDesigns: async (_, { gameId }, { models, userId }) => {
      return (await models.Player.get(gameId, userId)).availableShipDesigns;
    },
  },
};
