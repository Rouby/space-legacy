import { subject } from '@casl/ability';
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
      // TODO specialized loader/model?
      return models.Game.get(gameId)
        .then((game) =>
          Promise.all(game.starSystems.map((system) => system.$resolve)),
        )
        .then((systems) =>
          systems.filter((system) =>
            ability.can('view', subject('StarSystem', system)),
          ),
        );
    },
  },
};
