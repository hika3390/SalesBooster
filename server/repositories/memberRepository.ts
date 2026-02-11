import { prisma } from '@/lib/prisma';
import { MemberRole, MemberStatus } from '@prisma/client';

export const memberRepository = {
  findAll() {
    return prisma.member.findMany({
      include: { department: true },
      orderBy: { id: 'asc' },
    });
  },

  findByIds(ids: number[]) {
    return prisma.member.findMany({
      where: { id: { in: ids } },
      include: { department: true },
      orderBy: { id: 'asc' },
    });
  },

  findById(id: number) {
    return prisma.member.findUnique({
      where: { id },
      include: { department: true },
    });
  },

  create(data: { name: string; email: string; role?: MemberRole; imageUrl?: string; departmentId?: number }) {
    return prisma.member.create({ data });
  },

  update(id: number, data: { name?: string; email?: string; role?: MemberRole; status?: MemberStatus; imageUrl?: string; departmentId?: number }) {
    return prisma.member.update({ where: { id }, data });
  },

  delete(id: number) {
    return prisma.member.delete({ where: { id } });
  },
};
