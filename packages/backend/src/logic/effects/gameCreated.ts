import { GameEvent } from '@prisma/client';
import { publishEvent } from '..';
import { pubSub } from '../../graphql/context';
import { logger } from '../../logger';
import { AppEvent, createStarSystem } from '../events';

export async function gameCreated(
  event: Omit<GameEvent, 'payload'> & AppEvent,
) {
  if (event.type === 'createGame') {
    logger.info('Effect - gameCreated');

    // calculate stars?
    await new Promise((resolve) => setTimeout(resolve, 500));
    publishEvent({
      event: createStarSystem({
        name: 'System One',
        coordinates: { x: 0, y: 0 },
      }),
      trigger: event,
    });

    pubSub.publish('gameCreated', { id: event.payload.id });
  }
}
