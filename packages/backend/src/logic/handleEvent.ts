import { GameEvent } from '@prisma/client';
import { logger } from '../logger';
import { effects } from './effects';
import { AppEvent } from './events';
import { publishEvent } from './publishEvent';

export async function handleEvent(
  event: Omit<GameEvent, 'payload'> & AppEvent,
) {
  for (const effect of effects) {
    const collector: AppEvent[] = [];
    effect(event, (event) => {
      collector.push(event);
      return event;
    }).then(async (fn) => {
      for (const collectedEvent of collector) {
        await publishEvent({ event: collectedEvent, trigger: event });
      }
      fn?.();
      logger.debug(event, 'Handled event');
    });
  }
}
