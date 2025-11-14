import { NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import type { UserRole } from '@prisma/client';
import { HttpError } from '@/lib/repo/errors';

interface GuardResult {
  userId: string;
  role: UserRole;
  mode: 'dev' | 'internal';
  rateLimitKey: string;
}

const DEV_DEFAULT_USER: GuardResult = {
  userId: 'dev-anonymous',
  role: 'client',
  mode: 'dev',
  rateLimitKey: 'dev-anonymous',
};

const DEV_TOKEN_USERS: Record<
  string,
  {
    userId: string;
    role: UserRole;
  }
> = {
  'demo-client': { userId: 'dev-client', role: 'client' },
  'demo-agent': { userId: 'dev-agent', role: 'agent' },
  'demo-admin': { userId: 'dev-admin', role: 'admin' },
};

const ALLOWED_DEV_ROLES: Set<UserRole> = new Set(['client', 'agent', 'investor', 'admin']);

const getClientIp = (request: NextRequest) =>
  request.ip ??
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
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
 * Temporary guard for realtime endpoints.
 *
 * - Development: allows a small, known set of demo identities (or a safe default)
 *   so existing mocks continue to function. This must be replaced before launch.
 * - Production: blocks by default unless a pre-shared secret header is provided.
 *
 * TODO: Replace with real session-based auth (Supabase/NextAuth) before production launch.
 */
export const ensureRealtimeAccess = (request: NextRequest): GuardResult => {
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

  const devToken =
    request.headers.get('x-lumina-dev-token') ??
    request.cookies.get('lumina_dev_token')?.value ??
    null;

  if (devToken && DEV_TOKEN_USERS[devToken]) {
    const { userId, role } = DEV_TOKEN_USERS[devToken];
    return {
      userId,
      role,
      mode: 'dev',
      rateLimitKey: toRateLimitKey(userId, request),
    };
  }

  const headerId = request.headers.get('x-user-id');
  const headerRole = request.headers.get('x-user-role');
  if (headerId && headerRole && ALLOWED_DEV_ROLES.has(headerRole as UserRole)) {
    return {
      userId: headerId,
      role: headerRole as UserRole,
      mode: 'dev',
      rateLimitKey: toRateLimitKey(headerId, request),
    };
  }

  // Default fall-back keeps current dev experience working while clearly marking the path.
  // TODO: require explicit dev token once front-end wiring is in place.
  return {
    ...DEV_DEFAULT_USER,
    rateLimitKey: toRateLimitKey(DEV_DEFAULT_USER.userId, request),
  };
};



