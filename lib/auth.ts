import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from './prisma';
import { auditLogRepository } from '@/server/repositories/auditLogRepository';

const WEAK_SECRETS = [
  'sales-booster-secret-key-change-in-production',
  'secret',
  'password',
  'changeme',
];

const MIN_SECRET_LENGTH = 32;

function validateNextAuthSecret(): void {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error(
      'NEXTAUTH_SECRET が設定されていません。以下のコマンドで生成してください:\n' +
      'node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64url\'))"'
    );
  }
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `NEXTAUTH_SECRET は${MIN_SECRET_LENGTH}文字以上である必要があります（現在: ${secret.length}文字）`
    );
  }
  if (WEAK_SECRETS.includes(secret)) {
    throw new Error(
      'NEXTAUTH_SECRET に既知の弱いシークレットが使用されています。安全なランダム値に変更してください。'
    );
  }
}

if (process.env.NODE_ENV === 'production') {
  validateNextAuthSecret();
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'メールアドレス', type: 'email' },
        password: { label: 'パスワード', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (user?.id) {
        auditLogRepository.create({
          userId: user.id,
          action: 'USER_LOGIN',
        }).catch((err) => console.error('Audit log failed:', err));
      }
    },
    async signOut({ token }) {
      if (token?.id) {
        auditLogRepository.create({
          userId: token.id as string,
          action: 'USER_LOGOUT',
        }).catch((err) => console.error('Audit log failed:', err));
      }
    },
  },
  pages: {
    signIn: '/login',
  },
};
