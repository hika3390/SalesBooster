import { prisma } from '@/lib/prisma';

export const salesRecordRepository = {
  findByPeriod(startDate: Date, endDate: Date, memberIds?: number[]) {
    return prisma.salesRecord.findMany({
      where: {
        recordDate: { gte: startDate, lte: endDate },
        ...(memberIds ? { memberId: { in: memberIds } } : {}),
      },
      include: { member: { include: { department: true } } },
    });
  },

  create(data: { memberId: number; amount: number; description?: string; recordDate: Date }) {
    return prisma.salesRecord.create({ data });
  },
};
