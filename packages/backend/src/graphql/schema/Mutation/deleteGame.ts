import { subject } from '@casl/ability';
import { GraphQLYogaError } from '@graphql-yoga/node';
import { deleteGame } from '../../../logic/events';
import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
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
      { publishEvent, ability, models },
    ) => {
      const game = await models.Game.get(id);

      if (!game || ability.cannot('delete', subject('Game', game))) {
        throw new GraphQLYogaError('Unauthorized');
      }

      await publishEvent({
        event: deleteGame({
          id,
        }),
      });

      return models.Game.get(id);
    },
  },
};
