import { NextRequest, NextResponse } from 'next/server';
import { displayService } from '../services/displayService';
import { VALID_TRANSITIONS } from '@/types/display';

export const displayController = {
  async getConfig() {
    try {
      const config = await displayService.getConfig();
      return NextResponse.json(config);
    } catch (error) {
      console.error('Failed to fetch display config:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  },

  async updateConfig(request: NextRequest) {
    try {
      const body = await request.json();

      if (!body.views || !Array.isArray(body.views)) {
        return NextResponse.json({ error: 'views is required' }, { status: 400 });
      }

      if (body.transition && !VALID_TRANSITIONS.includes(body.transition)) {
        return NextResponse.json({ error: 'Invalid transition type' }, { status: 400 });
      }

      await displayService.updateConfig(body);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Failed to update display config:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  },
};
