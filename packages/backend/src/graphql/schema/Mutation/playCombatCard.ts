import { ForbiddenError } from '@casl/ability';
import { playCombatCard } from '../../../logic/events';
import { Combat } from '../../../logic/models';
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
      { publishEvent, ability, get, userId },
    ) => {
      const combat = await get(Combat, combatId);

      ForbiddenError.from(ability).throwUnlessCan('playCard', combat);

      await publishEvent({
        event: playCombatCard({
          gameId,
          combatId,
          userId,
          cardId: card,
        }),
      });

      return await get(Combat, combatId);
    },
  },
};
