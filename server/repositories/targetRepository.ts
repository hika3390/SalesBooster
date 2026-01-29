import { prisma } from '@/lib/prisma';

export const targetRepository = {
  findAll() {
    return prisma.target.findMany({
      include: { member: true },
      orderBy: { memberId: 'asc' },
    });
  },

  findByMemberAndPeriod(memberId: number, year: number, month: number) {
    return prisma.target.findUnique({
      where: { memberId_year_month: { memberId, year, month } },
    });
  },

  upsert(data: { memberId: number; monthly: number; quarterly: number; annual: number; year: number; month: number }) {
    return prisma.target.upsert({
      where: { memberId_year_month: { memberId: data.memberId, year: data.year, month: data.month } },
      update: { monthly: data.monthly, quarterly: data.quarterly, annual: data.annual },
      create: data,
    });
  },
};
