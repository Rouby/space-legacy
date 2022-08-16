import { GameEvent } from '@prisma/client';
import { pubSub } from '../../graphql/context';
import { AppEvent } from '../events';

export async function gameCreated(
  event: Omit<GameEvent, 'payload'> & AppEvent,
) {
  if (event.type === 'createGame') {
    // calculate stars?
    await new Promise((resolve) => setTimeout(resolve, 5000));

    pubSub.publish('gameCreated', { id: event.payload.id });
  }
}
