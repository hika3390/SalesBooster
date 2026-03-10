import { prisma } from '@/lib/prisma';

export const targetRepository = {
  findAll(tenantId: number) {
    return prisma.target.findMany({
      where: { tenantId },
      include: { user: true },
      orderBy: { userId: 'asc' },
    });
  },

  findByUserAndPeriod(userId: string, year: number, month: number, tenantId: number, dataTypeId?: number) {
    return prisma.target.findFirst({
      where: { tenantId, userId, year, month, dataTypeId: dataTypeId ?? null },
    });
  },

  findByUsersAndPeriod(userIds: string[], year: number, month: number, tenantId: number) {
    return prisma.target.findMany({
      where: { userId: { in: userIds }, year, month, tenantId },
    });
  },

  findByUsersAndPeriodRange(userIds: string[], startYear: number, startMonth: number, endYear: number, endMonth: number, tenantId: number) {
    const conditions: { year: number; month: number }[] = [];
    let y = startYear;
    let m = startMonth;
    while (y < endYear || (y === endYear && m <= endMonth)) {
      conditions.push({ year: y, month: m });
      m++;
      if (m > 12) { m = 1; y++; }
    }
    return prisma.target.findMany({
      where: {
        userId: { in: userIds },
        tenantId,
        OR: conditions,
      },
    });
  },

  async upsert(tenantId: number, data: { userId: string; monthly: number; quarterly: number; annual: number; year: number; month: number; dataTypeId?: number }) {
    const existing = await prisma.target.findFirst({
      where: { tenantId, userId: data.userId, year: data.year, month: data.month, dataTypeId: data.dataTypeId ?? null },
    });
    if (existing) {
      return prisma.target.update({
        where: { id: existing.id },
        data: { monthly: data.monthly, quarterly: data.quarterly, annual: data.annual },
      });
    }
    return prisma.target.create({
      data: { ...data, tenantId },
    });
  },
};
