import { authExchange } from '@urql/exchange-auth';
import { cacheExchange } from '@urql/exchange-graphcache';
import {
  createClient,
  dedupExchange,
  fetchExchange,
  gql,
  makeOperation,
} from 'urql';
import schema, { UpdateMutationCreateGameQuery } from './generated';

export const client = createClient({
  url: '/graphql',
  exchanges: [
    dedupExchange,
    cacheExchange({
      schema,
      updates: {
        Mutation: {
          createGame: (result, args, cache, info) => {
            if (result.createGame) {
              cache.updateQuery<UpdateMutationCreateGameQuery>(
                {
                  query: gql`
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
                  query: gql`
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
      },
    }),
    authExchange<{ token: string }>({
      getAuth: async ({ authState }) => {
        if (!authState) {
          const token =
            sessionStorage.getItem('token') ?? localStorage.getItem('token');
          if (token) {
            return { token };
          }
          return null;
        }

        return null;
      },
      addAuthToOperation: ({ authState, operation }) => {
        if (!authState || !authState.token) {
          return operation;
        }

        const fetchOptions =
          typeof operation.context.fetchOptions === 'function'
            ? operation.context.fetchOptions()
            : operation.context.fetchOptions || {};

        return makeOperation(operation.kind, operation, {
          ...operation.context,
          fetchOptions: {
            ...fetchOptions,
            headers: {
              ...fetchOptions.headers,
              Authorization: `Bearer ${authState.token}`,
            },
          },
        });
      },
    }),
    fetchExchange,
  ],
});
