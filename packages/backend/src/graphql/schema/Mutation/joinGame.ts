import { subject } from '@casl/ability';
import { GraphQLYogaError } from '@graphql-yoga/common';
import { joinGame } from '../../../logic/events';
import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
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
      {
        const { list } = await retrieveState('games');
        const game = list.find((d) => d.id === id);

        if (!game || ability.cannot('join', subject('Game', game))) {
          throw new GraphQLYogaError('Unauthorized');
        }
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
