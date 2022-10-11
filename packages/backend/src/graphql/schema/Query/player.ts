import { DiplomaticStance, Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Player {
    id: ID!
    userId: ID!
    name: String!
    turnEnded: Boolean!
    diplomaticStance: DiplomaticStance!
  }

  enum DiplomaticStance {
    FRIENDLY
    HOSTILE
  }
`;

export const resolvers: Resolvers = {
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
