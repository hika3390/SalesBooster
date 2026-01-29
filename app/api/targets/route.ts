import { NextRequest } from 'next/server';
import { targetController } from '@/server/controllers/targetController';

export async function GET() {
  return targetController.getAll();
}

export async function POST(request: NextRequest) {
  return targetController.upsert(request);
}
