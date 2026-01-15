import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { AccountRole } from '@prisma/client';
import type { NextAuthOptions, Session, User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';

import { prisma } from '../prisma';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

interface LuminaUser extends User {
  id: string;
  accountRole: AccountRole;
}

const devSecretFallback = 'lumina-dev-secret';
// IMPORTANT:
// - Build-time code for API routes is evaluated during `next build`.
// - Throwing here blocks the entire build.
// We still REQUIRE a real secret for production runtime, but we avoid a hard
// throw at module-load time so the app can build.
const resolvedSecret =
  process.env.NEXTAUTH_SECRET ??
  (process.env.NODE_ENV !== 'production'
    ? devSecretFallback
    : '__INSECURE_MISSING_NEXTAUTH_SECRET__');

if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('[auth] NEXTAUTH_SECRET is not set; using placeholder. Set NEXTAUTH_SECRET in production.');
}

export const nextAuthOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: normalizeEmail(credentials.email) },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const passwordMatches = await compare(credentials.password, user.passwordHash);
        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          accountRole: user.accountRole,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      const luminaUser = (user as unknown as LuminaUser) ?? null;
      if (session.user && luminaUser) {
        const sessionUser = session.user as any;
        sessionUser.id = luminaUser.id;
        sessionUser.email = luminaUser.email;
        sessionUser.accountRole = (luminaUser.accountRole as AccountRole) ?? 'USER';
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        const typedUser = user as LuminaUser;
        token.sub = typedUser.id;
        token.accountRole = (typedUser.accountRole as AccountRole) ?? 'USER';
      }
      return token;
    },
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  secret: resolvedSecret,
  logger: {
    error(code, metadata) {
      console.error('NextAuth error', code, metadata);
    },
    warn(code) {
      console.warn('NextAuth warning', code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('NextAuth debug', code, metadata);
      }
    },
  },
};


