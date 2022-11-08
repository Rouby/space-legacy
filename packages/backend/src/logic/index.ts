export * as models from './models';

import { EventStore } from '@rouby/event-sourcing';
import { getDbClient } from '../util';

EventStore.setupStore({
  async getEvents(since?) {
    const prisma = await getDbClient();

    const events = await prisma.gameEvent.findMany({
      where: {
        createdAt: {
          gt: since,
        },
      },
    });

    return events.map((event) => ({
      ...event,
      payload: event.payload && JSON.parse(event.payload),
    }));
  },
  async storeEvent(event) {
    const prisma = await getDbClient();

    const gameEvent = await prisma.gameEvent.create({
      data: {
        ...event,
        payload:
          'payload' in event && event.payload
            ? JSON.stringify(event.payload)
            : undefined,
      },
    });

    return {
      ...gameEvent,
      payload: gameEvent.payload && JSON.parse(gameEvent.payload),
    };
  },
});
