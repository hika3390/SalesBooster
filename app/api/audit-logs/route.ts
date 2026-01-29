import { NextRequest } from 'next/server';
import { auditLogController } from '@/server/controllers/auditLogController';

export async function GET(request: NextRequest) {
  return auditLogController.getAll(request);
}
