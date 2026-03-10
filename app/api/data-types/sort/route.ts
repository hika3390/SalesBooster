import { NextRequest } from 'next/server';
import { dataTypeController } from '@/server/controllers/dataTypeController';

export async function PUT(request: NextRequest) {
  return dataTypeController.updateSortOrders(request);
}
