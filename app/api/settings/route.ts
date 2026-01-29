import { NextRequest } from 'next/server';
import { settingsController } from '@/server/controllers/settingsController';

export async function GET() {
  return settingsController.getSettings();
}

export async function PUT(request: NextRequest) {
  return settingsController.updateSettings(request);
}
