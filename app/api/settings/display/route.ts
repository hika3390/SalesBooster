import { NextRequest } from 'next/server';
import { displayController } from '@/server/controllers/displayController';

export async function GET() {
  return displayController.getConfig();
}

export async function PUT(request: NextRequest) {
  return displayController.updateConfig(request);
}
