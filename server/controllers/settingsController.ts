import { NextRequest, NextResponse } from 'next/server';
import { settingsService } from '../services/settingsService';

export const settingsController = {
  async getSettings() {
    try {
      const data = await settingsService.getAllSettings();
      return NextResponse.json(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  },

  async updateSettings(request: NextRequest) {
    try {
      const body = await request.json();

      for (const [key, value] of Object.entries(body)) {
        await settingsService.updateSetting(key, String(value));
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Failed to update settings:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  },

  async getIntegrations() {
    try {
      const data = await settingsService.getAllIntegrations();
      return NextResponse.json(data);
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  },

  async updateIntegrationStatus(request: NextRequest, id: number) {
    try {
      const body = await request.json();
      const { status } = body;

      if (!status) {
        return NextResponse.json({ error: 'status is required' }, { status: 400 });
      }

      const integration = await settingsService.updateIntegrationStatus(id, status);
      return NextResponse.json(integration);
    } catch (error) {
      console.error('Failed to update integration:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  },
};
