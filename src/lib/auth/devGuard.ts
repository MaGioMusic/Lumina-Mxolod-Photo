import { NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import type { UserRole } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { HttpError } from '@/lib/repo/errors';

interface GuardResult {
  userId: string;
  role: UserRole;
  mode: 'session' | 'internal';
  rateLimitKey: string;
}

const getClientIp = (request: NextRequest) =>
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
  request.headers.get('x-real-ip') ??
  request.headers.get('cf-connecting-ip') ??
  'unknown';

const toRateLimitKey = (identifier: string, request: NextRequest) => {
  const ip = getClientIp(request);
  return `${identifier}:${ip}`;
};

const matchesSecret = (incoming: string, secret: string) => {
  try {
    const a = Buffer.from(incoming);
    const b = Buffer.from(secret);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
};

/**
 * Guard for realtime endpoints.
 *
 * - Production: blocks by default unless a pre-shared secret header is provided
 *   for internal service communication, OR a valid NextAuth session exists.
 * - Development: allows access with valid NextAuth session.
 */
export const ensureRealtimeAccess = async (request: NextRequest): Promise<GuardResult> => {
  // First, try to authenticate via NextAuth JWT token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (token?.sub) {
    // Valid session found
    const role = (token.accountRole as UserRole) || 'client';
    return {
      userId: token.sub,
      role,
      mode: 'session',
      rateLimitKey: toRateLimitKey(token.sub, request),
    };
  }

  // No valid session - in production, check for internal secret
  if (process.env.NODE_ENV === 'production') {
    const secret = process.env.LUMINA_REALTIME_PRESHARED_SECRET;
    if (!secret) {
      throw new HttpError(
        'Realtime access disabled',
        503,
        'REALTIME_DISABLED',
      );
    }

    const provided = request.headers.get('x-lumina-internal-secret');
    if (!provided || !matchesSecret(provided, secret)) {
      throw new HttpError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    return {
      userId: 'internal-realtime',
      role: 'admin',
      mode: 'internal',
      rateLimitKey: toRateLimitKey('internal-realtime', request),
    };
  }

  // Development mode: optional local bypass for realtime debugging.
  // Enable only on local/dev by setting LUMINA_DEV_ALLOW_REALTIME_NOAUTH=1
  if (process.env.LUMINA_DEV_ALLOW_REALTIME_NOAUTH === '1') {
    return {
      userId: 'dev-realtime-noauth',
      role: 'admin',
      mode: 'internal',
      rateLimitKey: toRateLimitKey('dev-realtime-noauth', request),
    };
  }

  // Development mode without session - unauthorized
  throw new HttpError('Unauthorized', 401, 'UNAUTHORIZED');
};
