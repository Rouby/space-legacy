import { cacheExchange as urlCacheExchange } from '@urql/exchange-graphcache';
import { gql } from 'urql';
import schema, {
  ConstructShipMutation,
  MutationConstructShipArgs,
  UpdateMutationConstructShipQuery,
  UpdateMutationCreateGameQuery,
} from './generated';

export const cacheExchange = urlCacheExchange({
  schema,
  keys: {
    Planet: () => null,
    Body: () => null,
    Shipyard: () => null,
    ShipConstruction: () => null,
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
      constructShip: (
        result: ConstructShipMutation,
        args: MutationConstructShipArgs,
        cache,
        info,
      ) => {
        if (result.constructShip) {
          cache.updateQuery<UpdateMutationConstructShipQuery>(
            {
              query: /* GraphQL */ `
                #graphql
                query UpdateMutationConstructShip(
                  $gameId: ID!
                  $systemId: ID!
                ) {
                  starSystem(gameId: $gameId, id: $systemId) {
                    id
                    shipyards {
                      shipConstructionQueue {
                        shipId
                        workLeft
                        materialsLeft
                      }
                    }
                  }
                }
              `,
              variables: {
                gameId: args.input.gameId,
                systemId: args.input.systemId,
              },
            },
            (data) => {
              if (data?.starSystem?.shipyards) {
                data?.starSystem?.shipyards[
                  args.input.shipyardIndex
                ].shipConstructionQueue.push(result.constructShip!);
              }
              return data;
            },
          );
        }
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
      nextRound: (result, args, cache, info) => {
        if (result.nextRound) {
          cache.writeFragment(
            gql`
              fragment _ on Game {
                id
                round
              }
            `,
            {
              id: (result.nextRound as any).id,
              round: (result.nextRound as any).round,
            },
          );
          cache
            .inspectFields('Query')
            .filter((field) => field.fieldName === 'starSystem')
            .forEach((field) =>
              cache.invalidate('Query', field.fieldName, field.arguments),
            );
          cache
            .inspectFields('Query')
            .filter((field) => field.fieldName === 'fleets')
            .forEach((field) =>
              cache.invalidate('Query', field.fieldName, field.arguments),
            );
        }
      },
    },
  },
});
