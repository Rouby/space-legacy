import { cacheExchange as urlCacheExchange } from '@urql/exchange-graphcache';
import { gql } from 'urql';
import schema, {
  CancelShipConstructionMutation,
  ConstructShipMutation,
  GameCreatedSubscription,
  MutationCancelShipConstructionArgs,
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
    CombatParty: (party: any) => party.player.id,
    CombatVersusParty: (party: any) => party.player.id,
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
                        design {
                          id
                        }
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
      cancelShipConstruction: (
        result: CancelShipConstructionMutation,
        args: MutationCancelShipConstructionArgs,
        cache,
        info,
      ) => {
        if (result.cancelShipConstruction) {
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
                        design {
                          id
                        }
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
                ].shipConstructionQueue.splice(args.input.queueIndex, 1);
              }
              return data;
            },
          );
        }
      },
    },
    Subscription: {
      gameCreated: (result: GameCreatedSubscription, args, cache, info) => {
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
              if (data?.games && result.gameCreated) {
                if (data.games.some((g) => g.id === result.gameCreated?.id)) {
                  data.games = data.games.map((g) =>
                    g.id === result.gameCreated?.id
                      ? { ...g, ...result.gameCreated }
                      : g,
                  );
                } else {
                  data.games.push(result.gameCreated);
                }
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
            .filter((field) => field.fieldName === 'game')
            .forEach((field) =>
              cache.invalidate('Query', field.fieldName, field.arguments),
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
          cache
            .inspectFields('Query')
            .filter((field) => field.fieldName === 'ships')
            .forEach((field) =>
              cache.invalidate('Query', field.fieldName, field.arguments),
            );
        }
      },
    },
  },
});
