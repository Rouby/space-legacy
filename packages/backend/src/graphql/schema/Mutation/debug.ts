import { ForbiddenError } from '@casl/ability';
import { logger } from '../../../logger';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  input UndoLastEndOfRoundInput {
    gameId: ID!
  }

  type Mutation {
    undoLastEndOfRound(input: UndoLastEndOfRoundInput!): Game!
  }
`;

export const resolvers: Resolvers = {
  Mutation: {
    undoLastEndOfRound: async (
      _,
      { input: { gameId } },
      { ability, models, prisma },
    ) => {
      ForbiddenError.from(ability).throwUnlessCan('debug', 'Game');

      logger.info({ gameId }, 'Undo last end of round');

      const lastNextRound = await prisma.gameEvent.findFirst({
        where: {
          type: 'nextRound',
          payload: { contains: `"gameId":"${gameId}"` },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (lastNextRound) {
        const firstCorrelatedEvent = await prisma.gameEvent.findFirst({
          where: {
            correlationId: lastNextRound?.correlationId,
          },
          orderBy: { createdAt: 'asc' },
        });
        if (firstCorrelatedEvent) {
          const eventsToDelete = await prisma.gameEvent.findMany({
            where: { createdAt: { gte: firstCorrelatedEvent.createdAt } },
            orderBy: { createdAt: 'desc' },
          });
          logger.info(`About to delete ${eventsToDelete.length} events`);
          for (const event of eventsToDelete) {
            await prisma.gameEvent.delete({ where: { id: event.id } });
          }
        }
      }

      return models.Game.get(gameId);
    },
  },
};
