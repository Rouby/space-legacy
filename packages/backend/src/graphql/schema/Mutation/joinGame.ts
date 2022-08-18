import { GraphQLYogaError } from '@graphql-yoga/common';
import { joinGame } from '../../../logic/events';
import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Game {
    id: ID!
    players: [Player!]!
  }

  input JoinGameInput {
    id: ID!
  }

  type Mutation {
    joinGame(input: JoinGameInput!): Game!
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Mutation: {
    joinGame: async (
      _,
      { input: { id } },
      { publishEvent, retrieveState, userId, ability },
    ) => {
      if (ability.cannot('join', 'Game')) {
        throw new GraphQLYogaError('Unauthorized');
      }

      await publishEvent({
        event: joinGame({
          gameId: id,
          userId: userId!,
        }),
      });

      const { list } = await retrieveState('games');

      return list.find((d) => d.id === id)!;
    },
  },
};
