import { prisma } from '@/lib/prisma';

interface PaginationFilters {
  startDate?: Date;
  endDate?: Date;
  memberId?: number;
}

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

  findById(id: number) {
    return prisma.salesRecord.findUnique({
      where: { id },
      include: { member: { include: { department: true } } },
    });
  },

  async findPaginated(page: number, pageSize: number, filters?: PaginationFilters) {
    const where: Record<string, unknown> = {};
    if (filters?.startDate || filters?.endDate) {
      where.recordDate = {
        ...(filters.startDate ? { gte: filters.startDate } : {}),
        ...(filters.endDate ? { lte: filters.endDate } : {}),
      };
    }
    if (filters?.memberId) {
      where.memberId = filters.memberId;
    }

    const [records, total] = await Promise.all([
      prisma.salesRecord.findMany({
        where,
        include: { member: { include: { department: true } } },
        orderBy: { recordDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.salesRecord.count({ where }),
    ]);

    return { records, total };
  },

  update(id: number, data: { memberId?: number; amount?: number; description?: string; recordDate?: Date }) {
    return prisma.salesRecord.update({
      where: { id },
      data,
      include: { member: { include: { department: true } } },
    });
  },

  remove(id: number) {
    return prisma.salesRecord.delete({ where: { id } });
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
