import { prisma } from '@/lib/prisma';
import { MemberRole, MemberStatus } from '@prisma/client';

export const memberRepository = {
  findAll(tenantId: number) {
    return prisma.member.findMany({
      where: { tenantId },
      include: { department: true },
      orderBy: { id: 'asc' },
    });
  },

  findByIds(ids: number[], tenantId: number) {
    return prisma.member.findMany({
      where: { id: { in: ids }, tenantId },
      include: { department: true },
      orderBy: { id: 'asc' },
    });
  },

  findById(id: number, tenantId: number) {
    return prisma.member.findFirst({
      where: { id, tenantId },
      include: { department: true },
    });
  },

  findByEmails(emails: string[], tenantId: number) {
    return prisma.member.findMany({
      where: { email: { in: emails }, tenantId },
      select: { email: true },
    });
  },

  create(tenantId: number, data: { name: string; email: string; role?: MemberRole; imageUrl?: string; departmentId?: number }) {
    return prisma.member.create({ data: { ...data, tenantId } });
  },

  update(id: number, tenantId: number, data: { name?: string; email?: string; role?: MemberRole; status?: MemberStatus; imageUrl?: string; departmentId?: number }) {
    return prisma.member.updateMany({ where: { id, tenantId }, data });
  },

  delete(id: number, tenantId: number) {
    return prisma.member.deleteMany({ where: { id, tenantId } });
  },
};
