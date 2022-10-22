import { ForbiddenError } from '@casl/ability';
import { GraphQLYogaError } from '@graphql-yoga/node';
import { endTurn } from '../../../logic/events';
import { Game } from '../../../logic/models';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  input EndTurnInput {
    gameId: ID!
  }

  type Mutation {
    endTurn(input: EndTurnInput!): Game!
  }
`;

export const resolvers: Resolvers = {
  Mutation: {
    endTurn: async (
      _,
      { input: { gameId } },
      { publishEvent, ability, get, userId },
    ) => {
      const game = await get(Game, gameId);

      if (!game) {
        throw new GraphQLYogaError('Game not found');
      }

      ForbiddenError.from(ability).throwUnlessCan('endTurn', game);

      await publishEvent({ event: endTurn({ gameId, userId }) });

      return get(Game, gameId);
    },
  },
};
