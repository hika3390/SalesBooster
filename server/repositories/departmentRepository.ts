import { prisma } from '@/lib/prisma';

export const departmentRepository = {
  findAll() {
    return prisma.department.findMany({
      orderBy: { id: 'asc' },
    });
  },
};
