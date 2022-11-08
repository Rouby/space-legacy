import { ForbiddenError } from '@casl/ability';
import { GraphQLYogaError } from '@graphql-yoga/node';
import { getInstance } from '@rouby/event-sourcing';
import { startGame } from '../../../logic/events';
import { Game } from '../../../logic/models';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  input StartGameInput {
    id: ID!
  }

  type Mutation {
    startGame(input: StartGameInput!): Game!
  }
`;

export const resolvers: Resolvers = {
  Mutation: {
    startGame: async (_, { input: { id } }, { publishEvent, ability }) => {
      const game = await getInstance(Game, id);

      if (!game) {
        throw new GraphQLYogaError('Game not found');
      }

      ForbiddenError.from(ability).throwUnlessCan('start', game);

      await publishEvent({
        event: startGame({
          gameId: id,
        }),
      });

      return getInstance(Game, id);
    },
  },
};
