import { GameEvent } from '@prisma/client';
import { AppEvent } from '../events';

export function gameCreated(event: Omit<GameEvent, 'payload'> & AppEvent) {
  if (event.type === 'createGame') {
    // calculate stars?
  }
}
