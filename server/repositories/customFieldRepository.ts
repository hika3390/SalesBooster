import { prisma } from '@/lib/prisma';
import { CustomFieldType, Prisma } from '@prisma/client';

export const customFieldRepository = {
  findAll() {
    return prisma.customField.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  },

  findActive() {
    return prisma.customField.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  },

  findById(id: number) {
    return prisma.customField.findUnique({ where: { id } });
  },

  create(data: { name: string; fieldType: CustomFieldType; options?: Prisma.InputJsonValue; isRequired?: boolean; sortOrder?: number }) {
    return prisma.customField.create({ data });
  },

  update(id: number, data: { name?: string; fieldType?: CustomFieldType; options?: Prisma.InputJsonValue; isRequired?: boolean; sortOrder?: number; isActive?: boolean }) {
    return prisma.customField.update({ where: { id }, data });
  },

  softDelete(id: number) {
    return prisma.customField.update({
      where: { id },
      data: { isActive: false },
    });
  },
};
