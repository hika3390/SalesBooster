import { prisma } from '@/lib/prisma';

export const auditLogRepository = {
  findAll(options?: { skip?: number; take?: number }) {
    return prisma.auditLog.findMany({
      skip: options?.skip,
      take: options?.take,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    });
  },

  count() {
    return prisma.auditLog.count();
  },

  create(data: { userId: string; action: string; detail?: string }) {
    return prisma.auditLog.create({ data });
  },
};
