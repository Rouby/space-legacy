import { ForbiddenError } from '@casl/ability';
import { GraphQLYogaError } from '@graphql-yoga/node';
import { endTurn } from '../../../logic/events';
import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  input EndTurnInput {
    gameId: ID!
  }

  type Mutation {
    endTurn(input: EndTurnInput!): Game!
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Mutation: {
    endTurn: async (
      _,
      { input: { gameId } },
      { publishEvent, ability, models, userId },
    ) => {
      const game = await models.Game.get(gameId);

      if (!game) {
        throw new GraphQLYogaError('Game not found');
      }

      ForbiddenError.from(ability).throwUnlessCan('endTurn', game);

      await publishEvent({ event: endTurn({ gameId, userId }) });

      return models.Game.get(gameId);
    },
  },
};
