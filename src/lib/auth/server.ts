import type { NextRequest } from 'next/server';
import type { UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { nextAuthOptions } from '@/lib/auth/nextAuthOptions';
import { prisma } from '@/lib/prisma';
import { ForbiddenError, HttpError } from '@/lib/repo/errors';

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  mode: 'session';
}

interface RequireUserOptions {
  allowedRoles?: UserRole[];
}

/**
 * Resolve the current user from the incoming request using NextAuth session.
 * This validates the session cookie and retrieves the user from the database.
 */
export const getCurrentUser = async (request: NextRequest): Promise<AuthenticatedUser | null> => {
  // Get the session from NextAuth
  const session = await getServerSession(nextAuthOptions);

  if (!session?.user?.id) {
    return null;
  }

  // Get user role from session (set by JWT callback in nextAuthOptions)
  const role = (session.user.accountRole as UserRole) || 'client';

  return {
    id: session.user.id as string,
    role,
    mode: 'session',
  };
};

/**
 * Require a user to be authenticated. Throws HttpError(401) if not authenticated.
 * Optionally checks if user has one of the allowed roles.
 */
export const requireUser = async (
  request: NextRequest,
  options?: RequireUserOptions,
): Promise<AuthenticatedUser> => {
  const user = await getCurrentUser(request);
  if (!user) {
    throw new HttpError('Unauthorized', 401, 'UNAUTHORIZED');
  }

  if (options?.allowedRoles && !options.allowedRoles.includes(user.role)) {
    throw new ForbiddenError();
  }

  return user;
};

interface ActorContext {
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
