import { ForbiddenError } from '@casl/ability';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Combat {
    id: ID!
    round: Int!
    coordinates: Coordinates!
    parties: [CombatParty!]!
  }

  type CombatParty {
    player: Player!
    cardsInHand: [CombatCard!]
    cardPlayed: CombatCard
    ships: [Ship!]!
    versus: [CombatVersusParty!]!
  }

  scalar CombatCard

  type CombatVersusParty {
    player: Player!
    ships: [Ship!]!
  }

  type Query {
    combat(id: ID!, gameId: ID!): Combat
  }
`;

export const resolvers: Resolvers = {
  Query: {
    combat: async (_, { gameId, id }, { models, ability, userId }) => {
      const combat = await models.Combat.get(id);

      ForbiddenError.from(ability).throwUnlessCan('participate', combat);

      return combat;
    },
  },
  CombatParty: {
    cardsInHand: async (party, _, { ability, models, userId }) => {
      if (party.player.userId !== userId) {
        return null;
      }

      return party.cardsInHand ?? null;
    },
    cardPlayed: async (party, _, { ability, models, userId }) => {
      if (party.player.userId !== userId) {
        return null;
      }

      return party.cardPlayed ?? null;
    },
  },
};
