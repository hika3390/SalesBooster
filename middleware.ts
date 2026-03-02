import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PATHS = ['/settings'];
const ADMIN_API_PREFIXES = ['/api/settings', '/api/integrations', '/api/custom-slides', '/api/upload'];

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });

  if (!token) {
    // APIルート: 401 JSON レスポンスを返す
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // ページ: ログインページへリダイレクト
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // ADMIN ロールチェック
  const isAdminPage = ADMIN_PATHS.some((p) => req.nextUrl.pathname.startsWith(p));
  const isAdminApi = ADMIN_API_PREFIXES.some((p) => req.nextUrl.pathname.startsWith(p));

  if ((isAdminPage || isAdminApi) && token.role !== 'ADMIN') {
    if (isAdminApi) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
