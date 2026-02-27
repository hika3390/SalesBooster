import { systemSettingRepository } from '../repositories/systemSettingRepository';
import { integrationRepository } from '../repositories/integrationRepository';
import { IntegrationStatus } from '@prisma/client';

export const settingsService = {
  async getAllSettings() {
    const settings = await systemSettingRepository.findAll();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }
    return settingsMap;
  },

  async updateSetting(key: string, value: string) {
    return systemSettingRepository.upsert(key, value);
  },

  async getAllIntegrations() {
    return integrationRepository.findAll();
  },

  async updateIntegrationStatus(id: number, status: IntegrationStatus) {
    return integrationRepository.updateStatus(id, status);
  },

  async updateIntegrationConfig(id: number, config: Record<string, string>) {
    return integrationRepository.updateConfig(id, config);
  },

  async getIntegrationByName(name: string) {
    return integrationRepository.findByName(name);
  },
};
