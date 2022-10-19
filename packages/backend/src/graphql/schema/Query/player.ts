import { DiplomaticStance, Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Player {
    id: ID!
    userId: ID!
    name: String!
    turnEnded: Boolean!
    diplomaticStance: DiplomaticStance!
  }

  type VisibilityRange {
    coordinates: Coordinates!
    range: Int!
  }

  enum DiplomaticStance {
    FRIENDLY
    HOSTILE
  }

  type Query {
    visibilityRanges(gameId: ID!): [VisibilityRange!]!
  }
`;

export const resolvers: Resolvers = {
  Query: {
    visibilityRanges: async (_, { gameId }, { models, userId }) => {
      const visibility = await models.Visibility.get(gameId, userId);

      return visibility.ranges();
    },
  },
  Player: {
    id: (player) => {
      return `${player.gameId}-${player.userId}`;
    },
    diplomaticStance: async (player, _, { userId }) => {
      const relationships = await player.relationships;
      return player.userId === userId || relationships[userId] === 'friendly'
        ? DiplomaticStance.Friendly
        : DiplomaticStance.Hostile;
    },
  },
};
