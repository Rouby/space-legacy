import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Query {
    researchPoints(gameId: ID!): Int!
  }
`;

export const resolvers: Resolvers = {
  Query: {
    researchPoints: async (_, { gameId }, { userId }) => {
      return 0;
    },
  },
};
