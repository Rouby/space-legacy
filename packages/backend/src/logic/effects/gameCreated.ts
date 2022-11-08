import { registerEffect } from '@rouby/event-sourcing';
import { pubSub } from '../../graphql/context';
import { logger } from '../../logger';

registerEffect(async function gameCreated(event, scheduleEvent) {
  if (event.type === 'createGame') {
    logger.info('Effect "gameCreated" triggered');

    return () => {
      pubSub.publish('gameCreated', { id: event.payload.id });
    };
  }
});
