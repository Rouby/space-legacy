import { PrismaClient } from '@prisma/client';

declare global {
  var __db__: PrismaClient;
}

let prisma: PrismaClient;
if (!global.__db__) {
  global.__db__ = new PrismaClient();
}
prisma = global.__db__;

export async function getDbClient() {
  await prisma.$connect();
  return prisma;
}
