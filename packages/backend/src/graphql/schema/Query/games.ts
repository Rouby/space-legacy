import { ForbiddenError } from '@casl/ability';
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
    games: async (_, __, { get, ability }) => {
      ForbiddenError.from(ability).throwUnlessCan('read', 'GamesList');

      const games = await get(GameList);

      return games.list.$resolveAll;
    },
  },
};
