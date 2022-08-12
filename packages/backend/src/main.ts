import { PrismaClient } from '@prisma/client';

import { createServer } from '@graphql-yoga/node';
import { context, schema } from './graphql';
import { initializeStores } from './logic';

declare global {
  var __db__: PrismaClient;
}

let prisma: PrismaClient;

const server = createServer({
  schema,
  context,
});

server.start();
initializeStores().then(() => console.log('Stores initialized'));

process.once('SIGINT', gracefulShutdown);
process.once('SIGTERM', gracefulShutdown);

function gracefulShutdown(signal: any) {
  Promise.all([prisma?.$disconnect(), server.stop()]).finally(() => {
    process.kill(process.pid, signal);
  });
}
