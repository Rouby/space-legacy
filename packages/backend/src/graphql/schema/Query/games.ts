import { ForbiddenError } from '@casl/ability';
import { getInstance } from '@rouby/event-sourcing';
import { GameList } from '../../../logic/models';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  input GameFilterInput {
    id: IDFilterInput
  }

  type Query {
    games: [Game!]!
  }
`;

export const resolvers: Resolvers = {
  Query: {
    games: async (_, __, { ability }) => {
      ForbiddenError.from(ability).throwUnlessCan('read', 'GamesList');

      const games = await getInstance(GameList);

      return games.list.$resolveAll;
    },
  },
};
