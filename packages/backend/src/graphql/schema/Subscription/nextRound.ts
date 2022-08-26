import { filter, map, pipe } from '@graphql-yoga/common';
import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  input GameFilter {
    id: IDFilter
  }

  input IDFilter {
    eq: ID
  }

  type Subscription {
    nextRound(filter: GameFilter): Game
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Subscription: {
    nextRound: {
      subscribe: (_, { filter: inputFilter }, { pubSub, models }) => {
        return pipe(
          pubSub.subscribe('gameNextRound'),
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
