import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function getUserId(req: NextRequest): Promise<string> {
  const token = await getToken({ req });
  if (!token?.id) {
    throw new Error('Unauthorized: userId not found in token');
  }
  return token.id as string;
}
