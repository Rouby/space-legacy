import { GameEvent } from '@prisma/client';
import Queue from 'async-await-queue';
import cuid from 'cuid';
import { logger } from '../logger';
import { getDbClient } from '../util';
import { AppEvent } from './events';
import { handleEvent } from './handleEvent';

export const eventQueue = new Queue();

export async function publishEvent<TEvent extends AppEvent>({
  event,
  trigger,
}: {
  event: TEvent;
  trigger?: { id: string; correlationId: string };
}) {
  const prisma = await getDbClient();

  const eventId = cuid();
  const gameEvent = await prisma.gameEvent.create({
    data: {
      id: eventId,
      causationId: trigger?.id ?? eventId,
      correlationId: trigger?.correlationId ?? eventId,
      type: event.type,
      version: event.version,
      payload:
        'payload' in event && event.payload
          ? JSON.stringify(event.payload)
          : undefined,
    },
  });

  const parsedEvent = {
    ...gameEvent,
    payload: JSON.parse(gameEvent.payload),
  } as any as Omit<GameEvent, 'payload'> & TEvent;

  eventQueue.run(() =>
    handleEvent(parsedEvent as Omit<GameEvent, 'payload'> & AppEvent),
  );

  logger.info(parsedEvent, 'Published event');

  return parsedEvent;
}
