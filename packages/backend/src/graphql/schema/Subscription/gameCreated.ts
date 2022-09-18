import { filter, map, pipe } from '@graphql-yoga/node';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Subscription {
    gameCreated(filter: GameFilterInput): Game
  }
`;

export const resolvers: Resolvers = {
  Subscription: {
    gameCreated: {
      subscribe: (_, { filter: inputFilter }, { pubSub, models }) => {
        return pipe(
          pubSub.subscribe('gameCreated'),
          filter(
            (game) => !inputFilter?.id?.eq || game.id === inputFilter?.id?.eq,
          ),
          map(async (game) => await models.Game.get(game.id)),
        );
      },
      resolve: (payload: any) => payload,
    },
  },
};
