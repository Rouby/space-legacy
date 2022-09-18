import { isTruthy } from '../../../util';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Query {
    ships(gameId: ID!): [Ship!]!
  }
`;

export const resolvers: Resolvers = {
  Query: {
    ships: async (_, { gameId }, { models, ability, userId }) => {
      return models.Game.get(gameId)
        .then((game) => Promise.all(game.ships.map((ship) => ship.$resolve)))
        .then((ships) =>
          Promise.all(
            ships.map(async (ship) =>
              (await ship.isVisibleTo(userId)) ? ship : null,
            ),
          ).then((ships) => ships.filter(isTruthy)),
        );
    },
  },
};
