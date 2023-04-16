import { ForbiddenError } from '@casl/ability';
import { getInstance, publishEvent } from '@rouby/event-sourcing';
import { createGame, joinGame } from '../../../logic/events';
import { Game } from '../../../logic/models';
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

export const resolvers: Resolvers = {
  Mutation: {
    createGame: async (
      _,
      { input: { name, maxPlayers } },
      { userId, ability },
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

      return getInstance(Game, gameId);
    },
  },
};
