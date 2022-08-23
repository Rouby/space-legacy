import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Query {
    starSystems(gameId: ID!): [StarSystem!]!
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Query: {
    starSystems: async (_, { gameId }, { retrieveState, ability }) => {
      // if (ability.cannot('read', 'GamesList')) {
      //   throw new GraphQLYogaError('Unauthorized');
      // }

      const { list } = await retrieveState('starSystems');

      return list[gameId];
    },
  },
};
