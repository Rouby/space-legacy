import { cacheExchange as urlCacheExchange } from '@urql/exchange-graphcache';
import schema, { UpdateMutationCreateGameQuery } from './generated';

export const cacheExchange = urlCacheExchange({
  schema,
  keys: {
    Planet: () => null,
    Body: () => null,
  },
  updates: {
    Mutation: {
      createGame: (result, args, cache, info) => {
        if (result.createGame) {
          cache.updateQuery<UpdateMutationCreateGameQuery>(
            {
              query: /* GraphQL */ `
                #graphql
                query UpdateMutationCreateGame {
                  games {
                    id
                  }
                }
              `,
            },
            (data) => {
              data?.games.push(result.createGame as any);
              return data;
            },
          );
        }
      },
      deleteGame: (result, args, cache, info) => {
        if (result.deleteGame) {
          cache.updateQuery<UpdateMutationCreateGameQuery>(
            {
              query: /* GraphQL */ `
                #graphql
                query UpdateMutationCreateGame {
                  games {
                    id
                  }
                }
              `,
            },
            (data) => {
              if (data?.games) {
                data.games = data.games.filter(
                  (g) => g.id !== (result.deleteGame as any).id,
                );
              }
              return data;
            },
          );
        }
      },
      endTurn: (result, args, cache, info) => {
        cache.invalidate('Query', 'currentRound');
      },
    },
    Subscription: {
      gameCreated: (result, args, cache, info) => {
        if (result.gameCreated) {
          cache.updateQuery<UpdateMutationCreateGameQuery>(
            {
              query: /* GraphQL */ `
                #graphql
                query UpdateMutationCreateGame {
                  games {
                    id
                  }
                }
              `,
            },
            (data) => {
              if (data?.games) {
                data.games = data.games.map((g) =>
                  g.id === (result.gameCreated as any).id
                    ? { ...g, ...(result.gameCreated as any) }
                    : g,
                );
              }
              return data;
            },
          );
        }
      },
    },
  },
});