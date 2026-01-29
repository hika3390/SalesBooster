import { NextRequest } from 'next/server';
import { salesController } from '@/server/controllers/salesController';

export async function GET(request: NextRequest) {
  return salesController.getSalesByPeriod(request);
}

export async function POST(request: NextRequest) {
  return salesController.createSalesRecord(request);
}
