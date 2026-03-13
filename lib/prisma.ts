import { Prisma, PrismaClient } from '@prisma/client';
import newrelic from 'newrelic';

const prismaClientOptions = {
  log: [{ emit: 'event' as const, level: 'error' as const }],
};

type PrismaClientWithEvents = PrismaClient<typeof prismaClientOptions>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientWithEvents | undefined;
};

function createPrismaClient(): PrismaClientWithEvents {
  const client = new PrismaClient(prismaClientOptions);

  client.$on('error', (e: Prisma.LogEvent) => {
    console.error(`[Prisma Error] ${e.message}`);
    newrelic.recordLogEvent({
      message: `[Prisma Error] ${e.message}`,
      level: 'error',
      timestamp: e.timestamp.getTime(),
    });
  });

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
