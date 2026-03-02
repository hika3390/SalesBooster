import { NextRequest } from 'next/server';
import { memberController } from '@/server/controllers/memberController';

export async function GET(request: NextRequest) {
  return memberController.getAll(request);
}

export async function POST(request: NextRequest) {
  return memberController.create(request);
}
