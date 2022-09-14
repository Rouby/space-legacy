import { ForbiddenError } from '@casl/ability';

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
      ForbiddenError.from(ability).throwUnlessCan('create', 'Game');

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
