import { prisma } from '@/lib/prisma';

export const departmentRepository = {
  findAll(tenantId: number) {
    return prisma.department.findMany({
      where: { tenantId },
      orderBy: { id: 'asc' },
    });
  },
};
