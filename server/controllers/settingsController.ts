import { NextRequest } from 'next/server';
import { settingsService } from '../services/settingsService';
import { auditLogService } from '../services/auditLogService';
import { lineNotificationService } from '../services/lineNotificationService';
import { ApiResponse } from '../lib/apiResponse';

export const settingsController = {
  async getSettings() {
    try {
      const data = await settingsService.getAllSettings();
      return ApiResponse.success(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      return ApiResponse.serverError();
    }
  },

  async updateSettings(request: NextRequest) {
    try {
      const body = await request.json();

      for (const [key, value] of Object.entries(body)) {
        await settingsService.updateSetting(key, String(value));
      }

      auditLogService.create({
        request,
        action: 'SETTINGS_UPDATE',
        detail: `システム設定を更新`,
      }).catch((err) => console.error('Audit log failed:', err));

      return ApiResponse.success({ success: true });
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to update settings');
    }
  },

  async getIntegrations() {
    try {
      const data = await settingsService.getAllIntegrations();
      return ApiResponse.success(data);
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
      return ApiResponse.serverError();
    }
  },

  async updateIntegrationStatus(request: NextRequest, id: number) {
    try {
      const body = await request.json();
      const { status } = body;

      if (!status) {
        return ApiResponse.badRequest('status is required');
      }

      const integration = await settingsService.updateIntegrationStatus(id, status);

      auditLogService.create({
        request,
        action: 'INTEGRATION_STATUS_UPDATE',
        detail: `連携ID:${id}のステータスを${status}に変更`,
      }).catch((err) => console.error('Audit log failed:', err));

      return ApiResponse.success(integration);
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to update integration');
    }
  },

  async updateIntegrationConfig(request: NextRequest, id: number) {
    try {
      const body = await request.json();
      const { config } = body;

      if (!config || typeof config !== 'object') {
        return ApiResponse.badRequest('config is required');
      }

      const integration = await settingsService.updateIntegrationConfig(id, config);

      auditLogService.create({
        request,
        action: 'INTEGRATION_STATUS_UPDATE',
        detail: `連携ID:${id}の設定を更新`,
      }).catch((err) => console.error('Audit log failed:', err));

      return ApiResponse.success(integration);
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to update integration config');
    }
  },

  async testLineNotification(request: NextRequest) {
    try {
      const body = await request.json();
      const { channelAccessToken, groupId } = body;

      if (!channelAccessToken || !groupId) {
        return ApiResponse.badRequest('channelAccessToken and groupId are required');
      }

      const result = await lineNotificationService.sendTestMessage(channelAccessToken, groupId);

      if (!result.success) {
        return ApiResponse.badRequest(result.error || 'テスト送信に失敗しました');
      }

      return ApiResponse.success({ message: 'テスト送信に成功しました' });
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to send test notification');
    }
  },
};
