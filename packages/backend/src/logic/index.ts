import { GameEvent } from '@prisma/client';
import Queue from 'async-await-queue';
import cuid from 'cuid';
import { logger } from '../logger';
import { getDbClient } from '../util';
import { aggregates } from './aggregates';
import { effects } from './effects';
import { AppEvent } from './events';

const stores = {
  games: aggregates[0].initialState,
  turnTracker: aggregates[1].initialState,
  starSystems: aggregates[2].initialState,
};

const eventQueue = new Queue();

export async function initializeStores() {
  const prisma = await getDbClient();

  // TODO get from DB?

  // TODO filter based on DB state of store?
  const events = await prisma.gameEvent.findMany({
    orderBy: { createdAt: 'asc' },
  });

  events.forEach((event) =>
    eventQueue.run(() =>
      handleEvent(
        { ...event, payload: JSON.parse(event.payload) } as Omit<
          GameEvent,
          'payload'
        > &
          AppEvent,
        true,
      ),
    ),
  );

  await eventQueue.flush();

  logger.info({ stores }, 'Stores initialized');
}

export async function retrieveState<
  TKey extends keyof typeof stores = keyof typeof stores,
>(key: TKey) {
  await eventQueue.flush();

  return stores[key];
}

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

async function handleEvent(
  event: Omit<GameEvent, 'payload'> & AppEvent,
  replay = false,
) {
  for (const aggregate of aggregates) {
    (stores as any)[aggregate.name] = aggregate(
      (stores as any)[aggregate.name],
      event,
    );
  }
  if (!replay) {
    for (const effect of effects) {
      effect(event);
    }
  }

  logger.debug(event, 'Handled event');
}
