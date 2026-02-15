import { NextRequest, NextResponse } from 'next/server';
import type { UserRole } from '@prisma/client';
import { ZodError } from 'zod';
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
  // Request validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: 'BAD_REQUEST',
          message: 'Invalid request payload',
          details: error.flatten(),
        },
      },
      { status: 400 }
    );
  }

  // Malformed JSON body (e.g. request.json() parse failure)
  if (error instanceof SyntaxError) {
    return NextResponse.json(
      {
        error: {
          code: 'BAD_REQUEST',
          message: 'Malformed JSON body',
        },
      },
      { status: 400 }
    );
  }

  // Domain/repo errors
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

export async function getOptionalUser(request: NextRequest): Promise<UserContext | null> {
  return resolveCurrentUser(request);
}
