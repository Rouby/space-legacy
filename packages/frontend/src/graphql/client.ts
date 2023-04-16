import { devtoolsExchange } from '@urql/devtools';
import { authExchange } from '@urql/exchange-auth';
import { useAtomValue, useSetAtom } from 'jotai';
import { useMemo } from 'react';
import {
  CombinedError,
  createClient,
  dedupExchange,
  fetchExchange,
  makeOperation,
  subscriptionExchange,
} from 'urql';
import customScalarsExchange from 'urql-custom-scalars-exchange';
import { tokenAtom } from '../utility';
import { cacheExchange } from './cache';
import schema from './generated';

export function useClient() {
  const token = useAtomValue(tokenAtom);
  const setToken = useSetAtom(tokenAtom);

  return useMemo(
    () =>
      createClient({
        url: '/graphql',
        exchanges: [
          devtoolsExchange,
          dedupExchange,
          customScalarsExchange({
            schema,
            scalars: {
              Coordinates: (value) => JSON.parse(value),
            },
          }),
          cacheExchange,
          authExchange<typeof token>({
            getAuth: async ({ authState }) => {
              if (!authState) {
                return token;
              }

              return null;
            },
            addAuthToOperation: ({ authState, operation }) => {
              if (!authState) {
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
                    Authorization: `Bearer ${authState}`,
                  },
                },
              });
            },
            didAuthError: ({ error }) => {
              if (error instanceof CombinedError) {
                const invalidToken = error.graphQLErrors.some(
                  (err) => err.extensions.token === 'invalid',
                );
                if (invalidToken) {
                  setToken(null);
                  return true;
                }
              }
              return false;
            },
          }),
          fetchExchange,
          subscriptionExchange({
            forwardSubscription(operation) {
              const url = new URL(
                `${location.protocol}//${location.host}/graphql`,
              );
              url.searchParams.append('query', operation.query);
              if (operation.variables) {
                url.searchParams.append(
                  'variables',
                  JSON.stringify(operation.variables),
                );
              }
              return {
                subscribe: (sink) => {
                  const eventsource = new EventSource(url.toString(), {
                    withCredentials: true,
                  });
                  eventsource.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    sink.next(data);
                    if (eventsource.readyState === 2) {
                      sink.complete();
                    }
                  };
                  eventsource.onerror = (error) => {
                    sink.error(error);
                  };
                  return {
                    unsubscribe: () => eventsource.close(),
                  };
                },
              };
            },
          }),
        ],
      }),
    [token],
  );
}
