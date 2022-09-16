import { subject } from '@casl/ability';
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
      return models.Game.get(gameId)
        .then((game) => Promise.all(game.ships.map((ship) => ship.$resolve)))
        .then((ships) =>
          ships.filter((ship) => ability.can('see', subject('Ship', ship))),
        );
    },
  },
};
