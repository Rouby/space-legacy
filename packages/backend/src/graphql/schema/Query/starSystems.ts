import { getInstance } from '@rouby/event-sourcing';
import { Game } from '../../../logic/models';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Query {
    starSystems(gameId: ID!): [StarSystem!]!
  }
`;

export const resolvers: Resolvers = {
  Query: {
    starSystems: async (_, { gameId }, {}) => {
      const game = await getInstance(Game, gameId);

      return game.starSystems.$resolveAll;
    },
  },
};
