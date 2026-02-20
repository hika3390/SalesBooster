import { NextRequest } from 'next/server';
import { salesController } from '@/server/controllers/salesController';

export async function POST(request: NextRequest) {
  return salesController.importSalesRecords(request);
}
