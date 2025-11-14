import type { NextRequest } from 'next/server';
import type { UserRole } from '@prisma/client';
import { ensureRealtimeAccess } from '@/lib/auth/devGuard';
import { prisma } from '@/lib/prisma';
import { ForbiddenError, HttpError } from '@/lib/repo/errors';

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  mode: 'dev' | 'internal';
}

export interface RequireUserOptions {
  allowedRoles?: UserRole[];
}

const hasExplicitIdentity = (request: NextRequest) => {
  if (request.headers.get('x-user-id')) return true;
  if (request.headers.get('x-lumina-dev-token')) return true;
  if (request.headers.get('x-lumina-internal-secret')) return true;
  if (request.cookies.get('lumina_dev_token')?.value) return true;
  return false;
};

/**
 * Resolve the current user from the incoming request.
 *
 * Dev mode permits a small set of mock identities (header- or token-based).
 * Production requires an internal pre-shared secret until real session auth is wired.
 *
 * TODO: Replace with real session-based auth (Supabase/NextAuth) before production launch.
 */
export const getCurrentUser = (request: NextRequest): AuthenticatedUser | null => {
  try {
    const result = ensureRealtimeAccess(request);
    const explicit = hasExplicitIdentity(request) || process.env.NODE_ENV === 'production';

    if (!explicit && result.userId === 'dev-anonymous') {
      // Mirror legacy behaviour: if no explicit identity provided, treat as unauthenticated.
      return null;
    }

    return {
      id: result.userId,
      role: result.role,
      mode: result.mode,
    };
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.status === 401 || error.status === 503) {
        return null;
      }
      // For other HttpError values we surface them to the caller.
      throw error;
    }
    // Non-HTTP errors are treated as unauthenticated but logged by callers if needed.
    return null;
  }
};

export const requireUser = (
  request: NextRequest,
  options?: RequireUserOptions,
): AuthenticatedUser => {
  const user = getCurrentUser(request);
  if (!user) {
    throw new HttpError('Unauthorized', 401, 'UNAUTHORIZED');
  }

  if (options?.allowedRoles && !options.allowedRoles.includes(user.role)) {
    throw new ForbiddenError();
  }

  return user;
};

export interface ActorContext {
  userId: string;
  agentId: string | null;
  isAdmin: boolean;
}

export const resolveActorContext = async (user: AuthenticatedUser): Promise<ActorContext> => {
  const isAdmin = user.role === 'admin';
  let agentId: string | null = null;
  if (user.role === 'agent') {
    const agent = await prisma.agent.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    agentId = agent?.id ?? null;
  }
  return {
    userId: user.id,
    agentId,
    isAdmin,
  };
};


