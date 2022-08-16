import { authExchange } from '@urql/exchange-auth';
import {
  createClient,
  dedupExchange,
  fetchExchange,
  makeOperation,
  subscriptionExchange,
} from 'urql';
import { cacheExchange } from './cache';

export const client = createClient({
  url: '/graphql',
  exchanges: [
    dedupExchange,
    cacheExchange,
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
    subscriptionExchange({
      forwardSubscription(operation) {
        const url = new URL(`${location.protocol}//${location.host}/graphql`);
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
});
