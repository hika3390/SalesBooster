import { CustomFieldType } from '@prisma/client';
import { customFieldRepository } from '../repositories/customFieldRepository';

export const customFieldService = {
  async getAll() {
    return customFieldRepository.findAll();
  },

  async getActive() {
    return customFieldRepository.findActive();
  },

  async create(data: { name: string; fieldType: CustomFieldType; options?: string[]; isRequired?: boolean }) {
    const all = await customFieldRepository.findAll();
    const maxOrder = all.reduce((max, f) => Math.max(max, f.sortOrder), -1);

    return customFieldRepository.create({
      name: data.name,
      fieldType: data.fieldType,
      options: data.options || undefined,
      isRequired: data.isRequired ?? false,
      sortOrder: maxOrder + 1,
    });
  },

  async update(id: number, data: { name?: string; fieldType?: CustomFieldType; options?: string[]; isRequired?: boolean; sortOrder?: number; isActive?: boolean }) {
    const existing = await customFieldRepository.findById(id);
    if (!existing) return null;

    return customFieldRepository.update(id, {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.fieldType !== undefined ? { fieldType: data.fieldType } : {}),
      ...(data.options !== undefined ? { options: data.options } : {}),
      ...(data.isRequired !== undefined ? { isRequired: data.isRequired } : {}),
      ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    });
  },

  async softDelete(id: number) {
    const existing = await customFieldRepository.findById(id);
    if (!existing) return null;

    return customFieldRepository.softDelete(id);
  },
};
