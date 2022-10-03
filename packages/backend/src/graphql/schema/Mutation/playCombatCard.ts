import { ForbiddenError } from '@casl/ability';
import { playCombatCard } from '../../../logic/events';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  input PlayCombatCardInput {
    gameId: ID!
    combatId: ID!
    card: CombatCard!
  }

  type Mutation {
    playCombatCard(input: PlayCombatCardInput!): Combat
  }
`;

export const resolvers: Resolvers = {
  Mutation: {
    playCombatCard: async (
      _,
      { input: { gameId, combatId, card } },
      { publishEvent, ability, models, userId },
    ) => {
      const combat = await models.Combat.get(combatId);

      ForbiddenError.from(ability).throwUnlessCan('playCard', combat);

      await publishEvent({
        event: playCombatCard({
          gameId,
          combatId,
          userId,
          cardId: card,
        }),
      });

      return await models.Combat.get(combatId);
    },
  },
};
