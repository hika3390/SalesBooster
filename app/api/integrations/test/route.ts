import { NextRequest } from 'next/server';
import { settingsController } from '@/server/controllers/settingsController';

export async function POST(request: NextRequest) {
  return settingsController.testLineNotification(request);
}
