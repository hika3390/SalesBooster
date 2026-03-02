import { prisma } from '@/lib/prisma';
import { CustomSlideType } from '@prisma/client';

export const customSlideRepository = {
  findAll() {
    return prisma.customSlide.findMany({ orderBy: { createdAt: 'asc' } });
  },

  findById(id: number) {
    return prisma.customSlide.findUnique({ where: { id } });
  },

  count() {
    return prisma.customSlide.count();
  },

  create(data: {
    slideType: CustomSlideType;
    title: string;
    content: string;
    imageUrl?: string;
  }) {
    return prisma.customSlide.create({ data });
  },

  update(id: number, data: {
    title?: string;
    content?: string;
    imageUrl?: string;
  }) {
    return prisma.customSlide.update({ where: { id }, data });
  },

  hardDelete(id: number) {
    return prisma.customSlide.delete({ where: { id } });
  },
};
