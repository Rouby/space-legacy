import { Game } from '../../../logic/models';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Query {
    starSystems(gameId: ID!): [StarSystem!]!
  }
`;

export const resolvers: Resolvers = {
  Query: {
    starSystems: async (_, { gameId }, { get, ability, userId }) => {
      const game = await get(Game, gameId);

      return game.starSystems.$resolveAll;
    },
  },
};
