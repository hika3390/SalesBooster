import { prisma } from '@/lib/prisma';

interface PaginationFilters {
  startDate?: Date;
  endDate?: Date;
  memberId?: number;
  memberIds?: number[];
}

export const salesRecordRepository = {
  findByPeriod(startDate: Date, endDate: Date, tenantId: number, memberIds?: number[]) {
    return prisma.salesRecord.findMany({
      where: {
        tenantId,
        recordDate: { gte: startDate, lte: endDate },
        ...(memberIds ? { memberId: { in: memberIds } } : {}),
      },
      include: { member: { include: { department: true } } },
    });
  },

  findById(id: number, tenantId: number) {
    return prisma.salesRecord.findFirst({
      where: { id, tenantId },
      include: { member: { include: { department: true } } },
    });
  },

  async findPaginated(page: number, pageSize: number, tenantId: number, filters?: PaginationFilters) {
    const where: Record<string, unknown> = { tenantId };
    if (filters?.startDate || filters?.endDate) {
      where.recordDate = {
        ...(filters.startDate ? { gte: filters.startDate } : {}),
        ...(filters.endDate ? { lte: filters.endDate } : {}),
      };
    }
    if (filters?.memberId) {
      where.memberId = filters.memberId;
    } else if (filters?.memberIds && filters.memberIds.length > 0) {
      where.memberId = { in: filters.memberIds };
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

  async findAll(tenantId: number, filters?: PaginationFilters) {
    const where: Record<string, unknown> = { tenantId };
    if (filters?.startDate || filters?.endDate) {
      where.recordDate = {
        ...(filters.startDate ? { gte: filters.startDate } : {}),
        ...(filters.endDate ? { lte: filters.endDate } : {}),
      };
    }
    if (filters?.memberId) {
      where.memberId = filters.memberId;
    } else if (filters?.memberIds && filters.memberIds.length > 0) {
      where.memberId = { in: filters.memberIds };
    }

    return prisma.salesRecord.findMany({
      where,
      include: { member: { include: { department: true } } },
      orderBy: { recordDate: 'desc' },
    });
  },

  update(id: number, tenantId: number, data: { memberId?: number; amount?: number; description?: string; recordDate?: Date; customFields?: Record<string, string> }) {
    return prisma.salesRecord.updateMany({
      where: { id, tenantId },
      data,
    });
  },

  remove(id: number, tenantId: number) {
    return prisma.salesRecord.deleteMany({ where: { id, tenantId } });
  },

  async findMinDate(tenantId: number): Promise<Date | null> {
    const result = await prisma.salesRecord.aggregate({
      where: { tenantId },
      _min: { recordDate: true },
    });
    return result._min.recordDate;
  },

  create(tenantId: number, data: { memberId: number; amount: number; description?: string; recordDate: Date; customFields?: Record<string, string> }) {
    return prisma.salesRecord.create({ data: { ...data, tenantId } });
  },

  createMany(tenantId: number, data: { memberId: number; amount: number; description?: string; recordDate: Date; customFields?: Record<string, string> }[]) {
    return prisma.salesRecord.createMany({
      data: data.map((d) => ({ ...d, tenantId })),
    });
  },
};
