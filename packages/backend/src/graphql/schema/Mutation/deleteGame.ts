import { subject } from '@casl/ability';
import { GraphQLYogaError } from '@graphql-yoga/node';
import { deleteGame } from '../../../logic/events';
import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Game {
    id: ID!
  }

  input DeleteGameInput {
    id: ID!
  }

  type Mutation {
    deleteGame(input: DeleteGameInput!): Game!
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Mutation: {
    deleteGame: async (
      _,
      { input: { id } },
      { publishEvent, stores, userId, ability },
    ) => {
      const game = stores.games.list.find((d) => d.id === id)!;

      if (!ability.can('delete', subject('Game', game))) {
        throw new GraphQLYogaError('Unauthorized');
      }

      await publishEvent({
        event: deleteGame({
          id,
        }),
      });

      return game;
    },
  },
};
