import { NextRequest, NextResponse } from 'next/server';

function isEnabled(value: string | undefined): boolean {
  return value === '1';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const agentsUiEnabled = isEnabled(process.env.NEXT_PUBLIC_FLAG_AGENTS_UI);

  if (!agentsUiEnabled) {
    // Marketing agents surfaces
    if (pathname === '/agents' || pathname.startsWith('/agents/')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Dashboard agents surfaces
    if (pathname === '/dashboard/agents' || pathname.startsWith('/dashboard/agents/')) {
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/agents/:path*', '/dashboard/agents/:path*'],
};
