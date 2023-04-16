import { ForbiddenError } from '@casl/ability';
import { GraphQLYogaError } from '@graphql-yoga/node';
import { getInstance, publishEvent } from '@rouby/event-sourcing';
import { deleteGame } from '../../../logic/events';
import { Game } from '../../../logic/models';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  input DeleteGameInput {
    id: ID!
  }

  type Mutation {
    deleteGame(input: DeleteGameInput!): Game!
  }
`;

export const resolvers: Resolvers = {
  Mutation: {
    deleteGame: async (_, { input: { id } }, { ability }) => {
      const game = await getInstance(Game, id);

      if (game.state === 'NON_EXISTENT') {
        throw new GraphQLYogaError('Game not found');
      }

      ForbiddenError.from(ability).throwUnlessCan('delete', game);

      await publishEvent({
        event: deleteGame({
          id,
        }),
      });

      return getInstance(Game, id);
    },
  },
};
