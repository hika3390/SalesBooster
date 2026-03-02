import { NextRequest } from 'next/server';
import { departmentController } from '@/server/controllers/departmentController';

export async function GET(request: NextRequest) {
  return departmentController.getAll(request);
}
