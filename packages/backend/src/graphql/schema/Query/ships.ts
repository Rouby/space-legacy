import { Game } from '../../../logic/models';
import { isTruthy } from '../../../util';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Query {
    ships(gameId: ID!): [Ship!]!
  }
`;

export const resolvers: Resolvers = {
  Query: {
    ships: async (_, { gameId }, { get, ability, userId }) => {
      const ships = await get(Game, gameId).then(
        (game) => game.ships.$resolveAll,
      );

      const visibleShips = await Promise.all(
        ships.map(async (ship) =>
          (await ship.isVisibleTo(userId)) ? ship : null,
        ),
      ).then((ships) => ships.filter(isTruthy));

      return visibleShips;
    },
  },
};
