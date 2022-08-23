import { authExchange } from '@urql/exchange-auth';
import { useAtomValue } from 'jotai';
import { useMemo, useRef } from 'react';
import {
  createClient,
  dedupExchange,
  fetchExchange,
  makeOperation,
  subscriptionExchange,
} from 'urql';
import { tokenAtom } from '../utility';
import { cacheExchange } from './cache';

export function useClient() {
  const token = useAtomValue(tokenAtom);
  const tokenRef = useRef(token);

  return useMemo(
    () =>
      createClient({
        url: '/graphql',
        exchanges: [
          dedupExchange,
          cacheExchange,
          authExchange<typeof tokenRef | null>({
            getAuth: async ({ authState }) => {
              if (!authState) {
                if (tokenRef.current) {
                  return tokenRef;
                }
                return null;
              }

              return null;
            },
            addAuthToOperation: ({ authState, operation }) => {
              if (!authState || !authState.current) {
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
                    Authorization: `Bearer ${authState.current}`,
                  },
                },
              });
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
    [!!token],
  );
}
