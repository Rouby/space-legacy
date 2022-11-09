import { createServer } from '@graphql-yoga/node';
import { PrismaClient } from '@prisma/client';
import { EventStore } from '@rouby/event-sourcing';
import { context, schema } from './graphql';
import { logger } from './logger';
import { getDbClient } from './util';

declare global {
  var __db__: PrismaClient;
}

let prisma: PrismaClient;

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
  Promise.all([prisma?.$disconnect(), server.stop()]).finally(() => {
    process.kill(process.pid, signal);
  });
}
