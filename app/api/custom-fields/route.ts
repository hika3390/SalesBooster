import { NextRequest } from 'next/server';
import { customFieldController } from '@/server/controllers/customFieldController';

export async function GET(request: NextRequest) {
  return customFieldController.getCustomFields(request);
}

export async function POST(request: NextRequest) {
  return customFieldController.createCustomField(request);
}
