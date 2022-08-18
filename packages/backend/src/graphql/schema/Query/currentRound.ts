import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Round {
    id: ID!
    count: Int!
  }

  type Query {
    currentRound: Round
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Query: {
    currentRound: async (_, __, { retrieveState }) => {
      return {
        id: '1',
        count: (await retrieveState('turnTracker')).turnsEnded,
      };
    },
  },
};
