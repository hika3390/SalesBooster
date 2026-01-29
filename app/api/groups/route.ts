import { NextRequest } from 'next/server';
import { groupController } from '@/server/controllers/groupController';

export async function GET() {
  return groupController.getAll();
}

export async function POST(request: NextRequest) {
  return groupController.create(request);
}
