import { CustomSlideType } from '@prisma/client';
import { customSlideRepository } from '../repositories/customSlideRepository';

const MAX_SLIDES = 10;

export const customSlideService = {
  async getAll() {
    return customSlideRepository.findAll();
  },

  async create(data: {
    slideType: CustomSlideType;
    title: string;
    content: string;
    imageUrl?: string;
  }) {
    const count = await customSlideRepository.count();
    if (count >= MAX_SLIDES) {
      throw new Error(`カスタムスライドは最大${MAX_SLIDES}件までです`);
    }

    return customSlideRepository.create({
      slideType: data.slideType,
      title: data.title,
      content: data.content,
      imageUrl: data.imageUrl,
    });
  },

  async update(id: number, data: {
    title?: string;
    content?: string;
    imageUrl?: string;
  }) {
    const existing = await customSlideRepository.findById(id);
    if (!existing) return null;
    return customSlideRepository.update(id, data);
  },

  async delete(id: number) {
    const existing = await customSlideRepository.findById(id);
    if (!existing) return null;
    return customSlideRepository.hardDelete(id);
  },
};
