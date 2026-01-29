import { prisma } from '@/lib/prisma';

export const salesRecordRepository = {
  findByPeriod(startDate: Date, endDate: Date) {
    return prisma.salesRecord.findMany({
      where: {
        recordDate: { gte: startDate, lte: endDate },
      },
      include: { member: { include: { department: true } } },
    });
  },

  create(data: { memberId: number; amount: number; description?: string; recordDate: Date }) {
    return prisma.salesRecord.create({ data });
  },
};
