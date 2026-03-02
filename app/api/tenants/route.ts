import { NextRequest } from 'next/server';
import { tenantController } from '@/server/controllers/tenantController';

export async function GET(request: NextRequest) {
  return tenantController.getAll(request);
}

export async function POST(request: NextRequest) {
  return tenantController.create(request);
}
