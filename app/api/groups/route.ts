import { NextRequest } from 'next/server';
import { groupController } from '@/server/controllers/groupController';

export async function GET(request: NextRequest) {
  return groupController.getAll(request);
}

export async function POST(request: NextRequest) {
  return groupController.create(request);
}
