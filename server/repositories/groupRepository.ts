import { prisma } from '@/lib/prisma';

export const groupRepository = {
  findAll() {
    return prisma.group.findMany({
      include: {
        members: { include: { member: true } },
      },
      orderBy: { id: 'asc' },
    });
  },

  findById(id: number) {
    return prisma.group.findUnique({
      where: { id },
      include: {
        members: { include: { member: true } },
      },
    });
  },

  create(data: { name: string; managerId?: number }) {
    return prisma.group.create({ data });
  },

  update(id: number, data: { name?: string; managerId?: number }) {
    return prisma.group.update({ where: { id }, data });
  },

  delete(id: number) {
    return prisma.group.delete({ where: { id } });
  },

  async syncMembers(groupId: number, memberIds: number[]) {
    await prisma.$transaction([
      prisma.groupMember.deleteMany({ where: { groupId } }),
      prisma.groupMember.createMany({
        data: memberIds.map((memberId) => ({ groupId, memberId })),
      }),
    ]);
  },
};
