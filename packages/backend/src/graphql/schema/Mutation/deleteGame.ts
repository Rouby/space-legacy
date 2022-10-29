import { ForbiddenError } from '@casl/ability';
import { GraphQLYogaError } from '@graphql-yoga/node';
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
    deleteGame: async (
      _,
      { input: { id } },
      { publishEvent, ability, get },
    ) => {
      const game = await get(Game, id);

      if (game.state === 'NON_EXISTENT') {
        throw new GraphQLYogaError('Game not found');
      }

      ForbiddenError.from(ability).throwUnlessCan('delete', game);

      await publishEvent({
        event: deleteGame({
          id,
        }),
      });

      return get(Game, id);
    },
  },
};
