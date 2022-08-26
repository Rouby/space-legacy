import { GameEvent } from '@prisma/client';
import { logger } from '../logger';
import { effects } from './effects';
import { AppEvent } from './events';

export async function handleEvent(
  event: Omit<GameEvent, 'payload'> & AppEvent,
) {
  for (const effect of effects) {
    effect(event);
  }

  logger.debug(event, 'Handled event');
}
