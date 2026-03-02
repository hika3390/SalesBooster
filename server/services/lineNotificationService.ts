import { settingsService } from './settingsService';

interface LineConfig {
  channelAccessToken: string;
  groupId: string;
}

interface SalesNotificationData {
  memberName: string;
  amount: number;
  recordDate: Date;
}

export const lineNotificationService = {
  async sendSalesNotification(tenantId: number, data: SalesNotificationData): Promise<void> {
    const integration = await settingsService.getIntegrationByName(tenantId, 'LINE Messaging API');

    if (!integration || integration.status !== 'CONNECTED') {
      return;
    }

    const config = integration.config as LineConfig | null;
    if (!config?.channelAccessToken || !config?.groupId) {
      console.warn('LINE config is incomplete, skipping notification');
      return;
    }

    const dateStr = new Date(data.recordDate).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const amountStr = data.amount.toLocaleString('ja-JP');

    const message = `売上登録\n\n担当: ${data.memberName}\n金額: ${amountStr}円\n日付: ${dateStr}`;

    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.channelAccessToken}`,
      },
      body: JSON.stringify({
        to: config.groupId,
        messages: [{ type: 'text', text: message }],
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(`LINE API error: ${res.status} ${body.message || ''}`);
    }
  },

  async sendTestMessage(
    channelAccessToken: string,
    groupId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${channelAccessToken}`,
        },
        body: JSON.stringify({
          to: groupId,
          messages: [
            {
              type: 'text',
              text: 'Sales Booster からのテスト通知です。接続に成功しました！',
            },
          ],
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return { success: false, error: body.message || `HTTP ${res.status}` };
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  },
};
