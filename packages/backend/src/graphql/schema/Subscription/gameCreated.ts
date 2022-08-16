import { filter, map, pipe } from '@graphql-yoga/node';
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
    gameCreated(filter: GameFilter): Game
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Subscription: {
    gameCreated: {
      subscribe: (_, { filter: inputFilter }, { pubSub, stores }) => {
        return pipe(
          pubSub.subscribe('gameCreated'),
          filter(
            (game) => !inputFilter?.id?.eq || game.id === inputFilter?.id?.eq,
          ),
          map((game) => stores.games.list.find((g) => g.id === game.id)),
        );
      },
      resolve: (payload: any) => payload,
    },
  },
};
