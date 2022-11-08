import { filter, map, pipe } from '@graphql-yoga/common';
import { getInstance } from '@rouby/event-sourcing';
import { Game } from '../../../logic/models';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Subscription {
    nextRound(filter: GameFilterInput): Game
  }
`;

export const resolvers: Resolvers = {
  Subscription: {
    nextRound: {
      subscribe: (_, { filter: inputFilter }, { pubSub }) => {
        return pipe(
          pubSub.subscribe('gameNextRound'),
          filter(
            (game) => !inputFilter?.id?.eq || game.id === inputFilter?.id?.eq,
          ),
          map(async (game) => await getInstance(Game, game.id)),
        );
      },
      resolve: (payload: any) => payload,
    },
  },
};
