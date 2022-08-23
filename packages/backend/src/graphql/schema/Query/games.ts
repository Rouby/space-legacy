import { GraphQLYogaError } from '@graphql-yoga/node';
import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Query {
    games: [Game!]!
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Query: {
    games: async (_, __, { retrieveState, ability }) => {
      if (ability.cannot('read', 'GamesList')) {
        throw new GraphQLYogaError('Unauthorized');
      }

      return (await retrieveState('games')).list;
    },
  },
};
