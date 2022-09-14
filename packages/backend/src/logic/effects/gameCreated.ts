import { GameEvent } from '@prisma/client';
import { pubSub } from '../../graphql/context';
import { logger } from '../../logger';
import { AppEvent } from '../events';

export async function gameCreated(
  event: Omit<GameEvent, 'payload'> & AppEvent,
  scheduleEvent: <TEvent extends AppEvent>(event: TEvent) => TEvent,
) {
  if (event.type === 'createGame') {
    logger.info('Effect "gameCreated" triggered');

    return () => {
      pubSub.publish('gameCreated', { id: event.payload.id });
    };
  }
}
