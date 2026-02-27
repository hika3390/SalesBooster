import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function getUserId(req: NextRequest): Promise<string> {
  const token = await getToken({ req });
  if (!token?.id) {
    throw new Error('Unauthorized: userId not found in token');
  }
  return token.id as string;
}

export async function getUserRole(req: NextRequest): Promise<string> {
  const token = await getToken({ req });
  return (token?.role as string) || 'USER';
}

export async function requireAdmin(req: NextRequest): Promise<void> {
  const role = await getUserRole(req);
  if (role !== 'ADMIN') {
    throw new Error('Forbidden: admin access required');
  }
}
