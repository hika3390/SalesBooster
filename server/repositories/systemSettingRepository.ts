import { prisma } from '@/lib/prisma';

export const systemSettingRepository = {
  findAll() {
    return prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
    });
  },

  findByKey(key: string) {
    return prisma.systemSetting.findUnique({
      where: { key },
    });
  },

  upsert(key: string, value: string) {
    return prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  },
};
