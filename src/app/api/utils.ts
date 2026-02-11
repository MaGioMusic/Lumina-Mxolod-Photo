import { NextRequest, NextResponse } from 'next/server';
import type { UserRole } from '@prisma/client';
import { HttpError } from '@/lib/repo/errors';
import {
  getCurrentUser as resolveCurrentUser,
  requireUser as coreRequireUser,
  type AuthenticatedUser,
} from '@/lib/auth/server';

export function jsonResponse<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function errorResponse(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details ?? null,
        },
      },
      { status: error.status }
    );
  }

  console.error('Unhandled API error', error);
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    { status: 500 }
  );
}

type UserContext = AuthenticatedUser;

export async function requireUser(request: NextRequest, allowedRoles?: UserRole[]): Promise<UserContext> {
  return coreRequireUser(request, { allowedRoles });
}

async function getOptionalUser(request: NextRequest): Promise<UserContext | null> {
  return resolveCurrentUser(request);
}
