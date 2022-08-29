import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Query {
    starSystems(gameId: ID!): [StarSystem!]!
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Query: {
    starSystems: async (_, { gameId }, { models, ability }) => {
      return models.Game.get(gameId).then(
        (game) => game.starSystems,
        // .filter((system) =>
        //   ability.can('view', subject('StarSystem', system)),
        // )
      );
    },
  },
};
