import { salesController } from '@/server/controllers/salesController';

export async function GET() {
  return salesController.getDateRange();
}
