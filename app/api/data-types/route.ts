import { NextRequest } from 'next/server';
import { dataTypeController } from '@/server/controllers/dataTypeController';

export async function GET(request: NextRequest) {
  return dataTypeController.getAll(request);
}

export async function POST(request: NextRequest) {
  return dataTypeController.create(request);
}
