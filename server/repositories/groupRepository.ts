import { prisma } from '@/lib/prisma';

export const groupRepository = {
  findAll(tenantId: number) {
    return prisma.group.findMany({
      where: { tenantId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { id: 'asc' },
    });
  },

  findById(id: number, tenantId: number) {
    return prisma.group.findFirst({
      where: { id, tenantId },
      include: {
        members: { select: { userId: true } },
      },
    });
  },

  create(tenantId: number, data: { name: string; managerId?: number }) {
    return prisma.group.create({ data: { ...data, tenantId } });
  },

  update(id: number, tenantId: number, data: { name?: string; managerId?: number }) {
    return prisma.group.updateMany({ where: { id, tenantId }, data });
  },

  delete(id: number, tenantId: number) {
    return prisma.group.deleteMany({ where: { id, tenantId } });
  },

  async syncMembers(groupId: number, tenantId: number, userIds: string[]) {
    const uniqueIds = [...new Set(userIds)];
    await prisma.$transaction([
      prisma.groupMember.deleteMany({ where: { groupId, tenantId } }),
      prisma.groupMember.createMany({
        data: uniqueIds.map((userId) => ({ groupId, userId, tenantId })),
      }),
    ]);
  },
};
