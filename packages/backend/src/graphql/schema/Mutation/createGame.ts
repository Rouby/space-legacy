import { GraphQLYogaError } from '@graphql-yoga/node';

import { createGame, joinGame } from '../../../logic/events';
import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  input CreateGameInput {
    name: String!
    maxPlayers: Int!
  }

  type Mutation {
    createGame(input: CreateGameInput!): Game!
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Mutation: {
    createGame: async (
      _,
      { input: { name, maxPlayers } },
      { publishEvent, userId, ability, models },
    ) => {
      if (ability.cannot('create', 'Game')) {
        throw new GraphQLYogaError('Unauthorized');
      }

      const createEvent = await publishEvent({
        event: createGame({
          name,
          maxPlayers,
          creatorId: userId!,
        }),
      });
      const gameId = createEvent.payload.id;

      await publishEvent({
        event: joinGame({
          gameId,
          userId: userId!,
        }),
      });

      return models.Game.get(gameId);
    },
  },
};
