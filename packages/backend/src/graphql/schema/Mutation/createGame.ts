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
      { publishEvent, retrieveState, userId, ability },
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

      const { list } = await retrieveState('games');

      return list.find((d) => d.id === gameId)!;
    },
  },
};
