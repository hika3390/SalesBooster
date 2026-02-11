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

  findByMembersAndPeriod(memberIds: number[], year: number, month: number) {
    return prisma.target.findMany({
      where: { memberId: { in: memberIds }, year, month },
    });
  },

  findByMembersAndPeriodRange(memberIds: number[], startYear: number, startMonth: number, endYear: number, endMonth: number) {
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
        memberId: { in: memberIds },
        OR: conditions,
      },
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
