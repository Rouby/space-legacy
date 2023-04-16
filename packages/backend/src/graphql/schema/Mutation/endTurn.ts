import { ForbiddenError } from '@casl/ability';
import { GraphQLYogaError } from '@graphql-yoga/node';
import { getInstance, publishEvent } from '@rouby/event-sourcing';
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
    endTurn: async (_, { input: { gameId } }, { ability, userId }) => {
      const game = await getInstance(Game, gameId);

      if (!game) {
        throw new GraphQLYogaError('Game not found');
      }

      ForbiddenError.from(ability).throwUnlessCan('endTurn', game);

      await publishEvent({ event: endTurn({ gameId, userId }) });

      return getInstance(Game, gameId);
    },
  },
};
