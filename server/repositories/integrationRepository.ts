import { prisma } from '@/lib/prisma';
import { IntegrationStatus } from '@prisma/client';

export const integrationRepository = {
  findAll(tenantId: number) {
    return prisma.integration.findMany({
      where: { tenantId },
      orderBy: { id: 'asc' },
    });
  },

  findById(id: number, tenantId: number) {
    return prisma.integration.findFirst({
      where: { id, tenantId },
    });
  },

  updateStatus(id: number, tenantId: number, status: IntegrationStatus) {
    return prisma.integration.updateMany({
      where: { id, tenantId },
      data: { status },
    });
  },

  updateConfig(id: number, tenantId: number, config: Record<string, string>) {
    return prisma.integration.updateMany({
      where: { id, tenantId },
      data: { config },
    });
  },

  findByName(name: string, tenantId: number) {
    return prisma.integration.findFirst({
      where: { name, tenantId },
    });
  },
};
