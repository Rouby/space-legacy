import { createServer } from '@graphql-yoga/node';
import { EventStore } from '@rouby/event-sourcing';
import { context, schema } from './graphql';
import { logger } from './logger';
import './logic/effects';
import { getDbClient } from './util';

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

const server = createServer({
  schema,
  context,
  logging: logger,
  hostname: 'localhost',
  maskedErrors: process.env.NODE_ENV === 'production',
});

server.start();

process.once('SIGINT', gracefulShutdown);
process.once('SIGTERM', gracefulShutdown);

function gracefulShutdown(signal: any) {
  Promise.all([
    getDbClient().then((client) => client.$disconnect()),
    server.stop(),
  ]).finally(() => {
    process.kill(process.pid, signal);
  });
}
