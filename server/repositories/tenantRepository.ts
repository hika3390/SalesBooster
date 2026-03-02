import { prisma } from '@/lib/prisma';

export const tenantRepository = {
  findAll() {
    return prisma.tenant.findMany({
      include: { _count: { select: { users: true, members: true } } },
      orderBy: { id: 'asc' },
    });
  },

  findById(id: number) {
    return prisma.tenant.findUnique({
      where: { id },
      include: { _count: { select: { users: true, members: true } } },
    });
  },

  findBySlug(slug: string) {
    return prisma.tenant.findUnique({ where: { slug } });
  },

  create(data: { name: string; slug: string }) {
    return prisma.tenant.create({ data });
  },

  update(id: number, data: { name?: string; slug?: string; isActive?: boolean }) {
    return prisma.tenant.update({ where: { id }, data });
  },

  delete(id: number) {
    return prisma.tenant.delete({ where: { id } });
  },
};
