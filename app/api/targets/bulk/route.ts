import { NextRequest } from 'next/server';
import { targetController } from '@/server/controllers/targetController';

export async function POST(request: NextRequest) {
  return targetController.bulkUpsert(request);
}
