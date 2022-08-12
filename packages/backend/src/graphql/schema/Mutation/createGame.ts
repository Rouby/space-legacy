import { GraphQLYogaError } from '@graphql-yoga/node';
import { createGame, joinGame } from '../../../logic/events';
import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Game {
    id: ID!
    name: String!
    maxPlayers: Int!
  }

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
      { publishEvent, stores, userId, ability },
    ) => {
      if (!ability.can('create', 'Game')) {
        throw new GraphQLYogaError('Unauthorized');
      }

      const createEvent = await publishEvent({
        event: createGame({
          name,
          maxPlayers,
          creatorId: userId!,
        }),
        awaitQueue: true,
      });
      const gameId = createEvent.payload.id;

      await publishEvent({
        event: joinGame({
          gameId,
          userId: userId!,
        }),
        awaitQueue: true,
      });

      return stores.games.list.find((d) => d.id === gameId)!;
    },
  },
};
