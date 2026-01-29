import { settingsController } from '@/server/controllers/settingsController';

export async function GET() {
  return settingsController.getIntegrations();
}
