import { NextRequest } from 'next/server';
import { settingsController } from '@/server/controllers/settingsController';

export async function GET(request: NextRequest) {
  return settingsController.getSettings(request);
}

export async function PUT(request: NextRequest) {
  return settingsController.updateSettings(request);
}
