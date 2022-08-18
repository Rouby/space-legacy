import { PrismaClient } from '@prisma/client';

import { createServer } from '@graphql-yoga/node';
import { context, schema } from './graphql';
import { logger } from './logger';
import { initializeStores } from './logic';

declare global {
  var __db__: PrismaClient;
}

let prisma: PrismaClient;

const server = createServer({
  schema,
  context,
  logging: logger,
});

initializeStores().then(() => {
  logger.info('Stores initialized');
  return server.start();
});

process.once('SIGINT', gracefulShutdown);
process.once('SIGTERM', gracefulShutdown);

function gracefulShutdown(signal: any) {
  console.log('grace');
  Promise.all([prisma?.$disconnect(), server.stop()]).finally(() => {
    process.kill(process.pid, signal);
  });
}
