import { prisma } from '@/lib/prisma';
import { IntegrationStatus } from '@prisma/client';

export const integrationRepository = {
  findAll() {
    return prisma.integration.findMany({
      orderBy: { id: 'asc' },
    });
  },

  findById(id: number) {
    return prisma.integration.findUnique({
      where: { id },
    });
  },

  updateStatus(id: number, status: IntegrationStatus) {
    return prisma.integration.update({
      where: { id },
      data: { status },
    });
  },

  updateConfig(id: number, config: Record<string, string>) {
    return prisma.integration.update({
      where: { id },
      data: { config },
    });
  },

  findByName(name: string) {
    return prisma.integration.findFirst({
      where: { name },
    });
  },
};
