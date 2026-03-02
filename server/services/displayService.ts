import { displayConfigRepository } from '../repositories/displayConfigRepository';
import { DisplayConfig, DEFAULT_DISPLAY_CONFIG, TransitionType } from '@/types/display';
import { DisplayTransition, DisplayViewType } from '@prisma/client';

export const displayService = {
  async getConfig(): Promise<DisplayConfig> {
    const record = await displayConfigRepository.find();
    if (!record) return DEFAULT_DISPLAY_CONFIG;

    return {
      loop: record.loop,
      dataRefreshInterval: record.dataRefreshInterval,
      filter: {
        groupId: record.filterGroupId,
        memberId: record.filterMemberId,
      },
      transition: record.transition as TransitionType,
      companyLogoUrl: record.companyLogoUrl,
      teamName: record.teamName,
      darkMode: record.darkMode,
      views: record.views.map((v) => ({
        viewType: v.viewType,
        enabled: v.enabled,
        duration: v.duration,
        order: v.order,
        title: v.title,
        customSlideId: v.customSlideId ?? null,
        customSlide: v.customSlide ? {
          id: v.customSlide.id,
          slideType: v.customSlide.slideType,
          title: v.customSlide.title,
          content: v.customSlide.content,
          imageUrl: v.customSlide.imageUrl,
        } : undefined,
      })),
    };
  },

  async updateConfig(config: DisplayConfig): Promise<void> {
    await displayConfigRepository.upsert({
      loop: config.loop,
      dataRefreshInterval: config.dataRefreshInterval,
      filterGroupId: config.filter.groupId,
      filterMemberId: config.filter.memberId,
      transition: config.transition as DisplayTransition,
      companyLogoUrl: config.companyLogoUrl,
      teamName: config.teamName,
      darkMode: config.darkMode,
      views: config.views.map((v) => ({
        viewType: v.viewType as DisplayViewType,
        enabled: v.enabled,
        duration: v.duration,
        order: v.order,
        title: v.title ?? '',
        customSlideId: v.customSlideId ?? null,
      })),
    });
  },
};
