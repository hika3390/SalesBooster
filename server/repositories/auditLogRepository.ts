import { prisma } from '@/lib/prisma';
import { AuditAction } from '@prisma/client';

export const auditLogRepository = {
  findAll(options?: { skip?: number; take?: number; startDate?: Date; endDate?: Date }) {
    const where = this._buildWhere(options?.startDate, options?.endDate);
    return prisma.auditLog.findMany({
      where,
      skip: options?.skip,
      take: options?.take,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    });
  },

  count(options?: { startDate?: Date; endDate?: Date }) {
    const where = this._buildWhere(options?.startDate, options?.endDate);
    return prisma.auditLog.count({ where });
  },

  _buildWhere(startDate?: Date, endDate?: Date) {
    if (!startDate && !endDate) return undefined;
    const createdAt: Record<string, Date> = {};
    if (startDate) createdAt.gte = startDate;
    if (endDate) createdAt.lte = endDate;
    return { createdAt };
  },

  create(data: { userId: string; action: AuditAction; detail?: string }) {
    return prisma.auditLog.create({ data });
  },
};
