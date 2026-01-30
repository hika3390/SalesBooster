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

  async findMinDate(): Promise<Date | null> {
    const result = await prisma.salesRecord.aggregate({
      _min: { recordDate: true },
    });
    return result._min.recordDate;
  },

  create(data: { memberId: number; amount: number; description?: string; recordDate: Date }) {
    return prisma.salesRecord.create({ data });
  },
};
