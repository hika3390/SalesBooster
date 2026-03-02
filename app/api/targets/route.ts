import { NextRequest } from 'next/server';
import { targetController } from '@/server/controllers/targetController';

export async function GET(request: NextRequest) {
  return targetController.getAll(request);
}

export async function POST(request: NextRequest) {
  return targetController.upsert(request);
}
