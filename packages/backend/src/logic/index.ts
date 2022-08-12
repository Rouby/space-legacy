import { GameEvent } from '@prisma/client';
import * as Queue from 'async-await-queue';
import * as cuid from 'cuid';
import { getDbClient } from '../prisma';
import { effects } from './effects';
import { AppEvent } from './events';
import { games, turnTracker } from './reducer';

const reducer = [games, turnTracker];
export const stores = {
  games: games.initialState,
  turnTracker: turnTracker.initialState,
};

const eventQueue = new (Queue as any as typeof Queue.default)();

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
}

export async function publishEvent<TEvent extends AppEvent>({
  event,
  trigger,
  awaitQueue,
}: {
  event: TEvent;
  trigger?: { id: string; correlationId: string };
  awaitQueue?: boolean;
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
  const promise = eventQueue.run(() => handleEvent(parsedEvent as any));
  if (awaitQueue) {
    await promise;
  }

  return parsedEvent;
}

async function handleEvent(
  event: Omit<GameEvent, 'payload'> & AppEvent,
  replay = false,
) {
  await Promise.all(
    reducer.map(async (reducer) => {
      (stores as any)[reducer.name] = await reducer(
        (stores as any)[reducer.name],
        event,
        replay,
      );
    }),
  );
  if (!replay) {
    await Promise.all(effects.map((effect) => effect(event)));
  }
}
