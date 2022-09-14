import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Query {
    ships(gameId: ID!): [Ship!]!
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Query: {
    ships: async (_, { gameId }, { models, ability }) => {
      return models.Game.get(gameId).then(
        (game) => game.ships,
        // .filter((system) =>
        //   ability.can('view', subject('StarSystem', system)),
        // )
      );
    },
  },
};
