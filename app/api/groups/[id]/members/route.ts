import { NextRequest } from 'next/server';
import { groupController } from '@/server/controllers/groupController';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return groupController.syncMembers(request, Number(id));
}
