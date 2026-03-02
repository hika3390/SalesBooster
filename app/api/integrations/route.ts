import { NextRequest } from 'next/server';
import { settingsController } from '@/server/controllers/settingsController';

export async function GET(request: NextRequest) {
  return settingsController.getIntegrations(request);
}
