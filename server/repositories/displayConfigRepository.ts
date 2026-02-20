import { prisma } from '@/lib/prisma';
import { DisplayTransition, DisplayViewType } from '@prisma/client';

export const displayConfigRepository = {
  async find() {
    return prisma.displayConfig.findFirst({
      include: { views: { orderBy: { order: 'asc' } } },
    });
  },

  async upsert(data: {
    loop: boolean;
    dataRefreshInterval: number;
    filterGroupId: string;
    filterMemberId: string;
    transition: DisplayTransition;
    companyLogoUrl: string;
    teamName: string;
    darkMode: boolean;
    views: { viewType: DisplayViewType; enabled: boolean; duration: number; order: number; title: string }[];
  }) {
    const existing = await prisma.displayConfig.findFirst();

    if (existing) {
      // 既存レコードを更新：ビューを全削除してから再作成（トランザクションで一貫性を保証）
      return prisma.$transaction(async (tx) => {
        await tx.displayConfigView.deleteMany({ where: { displayConfigId: existing.id } });
        return tx.displayConfig.update({
          where: { id: existing.id },
          data: {
            loop: data.loop,
            dataRefreshInterval: data.dataRefreshInterval,
            filterGroupId: data.filterGroupId,
            filterMemberId: data.filterMemberId,
            transition: data.transition,
            companyLogoUrl: data.companyLogoUrl,
            teamName: data.teamName,
            darkMode: data.darkMode,
            views: {
              create: data.views.map((v) => ({
                viewType: v.viewType,
                enabled: v.enabled,
                duration: v.duration,
                order: v.order,
                title: v.title,
              })),
            },
          },
          include: { views: { orderBy: { order: 'asc' } } },
        });
      });
    }

    // 新規作成
    return prisma.displayConfig.create({
      data: {
        loop: data.loop,
        dataRefreshInterval: data.dataRefreshInterval,
        filterGroupId: data.filterGroupId,
        filterMemberId: data.filterMemberId,
        transition: data.transition,
        companyLogoUrl: data.companyLogoUrl,
        teamName: data.teamName,
        darkMode: data.darkMode,
        views: {
          create: data.views.map((v) => ({
            viewType: v.viewType,
            enabled: v.enabled,
            duration: v.duration,
            order: v.order,
            title: v.title,
          })),
        },
      },
      include: { views: { orderBy: { order: 'asc' } } },
    });
  },
};
