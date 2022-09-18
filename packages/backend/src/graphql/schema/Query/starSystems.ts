import { isTruthy } from '../../../util';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Query {
    starSystems(gameId: ID!): [StarSystem!]!
  }
`;

export const resolvers: Resolvers = {
  Query: {
    starSystems: async (_, { gameId }, { models, ability, userId }) => {
      return models.Game.get(gameId)
        .then((game) =>
          Promise.all(game.starSystems.map((system) => system.$resolve)),
        )
        .then((systems) =>
          Promise.all(
            systems.map(async (system) =>
              (await system.isVisibleTo(userId)) ? system : null,
            ),
          ).then((systems) => systems.filter(isTruthy)),
        );
    },
  },
};
