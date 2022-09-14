import { ForbiddenError } from '@casl/ability';
import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  input GameFilterInput {
    id: IDFilterInput
  }

  type Query {
    games: [Game!]!
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Query: {
    games: async (_, __, { models, ability }) => {
      ForbiddenError.from(ability).throwUnlessCan('read', 'GamesList');

      return (await models.GameList.get()).list;
    },
  },
};
