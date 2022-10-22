import { ForbiddenError } from '@casl/ability';
import { GraphQLYogaError } from '@graphql-yoga/common';
import { joinGame } from '../../../logic/events';
import { Game } from '../../../logic/models';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  input JoinGameInput {
    id: ID!
  }

  type Mutation {
    joinGame(input: JoinGameInput!): Game!
  }
`;

export const resolvers: Resolvers = {
  Mutation: {
    joinGame: async (
      _,
      { input: { id } },
      { publishEvent, get, userId, ability },
    ) => {
      const game = await get(Game, id);

      if (!game) {
        throw new GraphQLYogaError('Game not found');
      }

      ForbiddenError.from(ability).throwUnlessCan('join', game);

      await publishEvent({
        event: joinGame({
          gameId: id,
          userId: userId!,
        }),
      });

      return get(Game, id);
    },
  },
};
