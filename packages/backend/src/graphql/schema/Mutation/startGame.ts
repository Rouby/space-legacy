import { ForbiddenError } from '@casl/ability';
import { GraphQLYogaError } from '@graphql-yoga/node';
import { startGame } from '../../../logic/events';
import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  input StartGameInput {
    id: ID!
  }

  type Mutation {
    startGame(input: StartGameInput!): Game!
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Mutation: {
    startGame: async (
      _,
      { input: { id } },
      { publishEvent, models, ability },
    ) => {
      const game = await models.Game.get(id);

      if (!game) {
        throw new GraphQLYogaError('Game not found');
      }

      ForbiddenError.from(ability).throwUnlessCan('start', game);

      await publishEvent({
        event: startGame({
          gameId: id,
        }),
      });

      return models.Game.get(id);
    },
  },
};
