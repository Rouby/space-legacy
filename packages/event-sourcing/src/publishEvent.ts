import Queue from 'async-await-queue';
import cuid from 'cuid';
import { EventStore } from '.';
import { AppEvent } from './AppEvent';
import { handleEffects } from './handleEffects';

export const eventQueue = new Queue();

export async function publishEvent<
  TEvent extends { type: string; version: number; payload: any },
>({
  event,
  trigger,
}: {
  event: TEvent;
  trigger?: { id: string; correlationId: string };
}) {
  const eventId = cuid();
  const gameEvent = await EventStore.storeEvent({
    id: eventId,
    causationId: trigger?.id ?? eventId,
    correlationId: trigger?.correlationId ?? eventId,
    type: event.type,
    version: event.version,
    payload: event.payload,
  });

  eventQueue.run(() => handleEffects(gameEvent));

  return gameEvent as AppEvent & TEvent;
}
