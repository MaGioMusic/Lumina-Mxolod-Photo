'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  requiredPermission?: {
    resource: string;
    action: string;
  };
  fallbackRoute?: string;
  /**
   * When true (default), unauthenticated users are redirected to fallbackRoute.
   * When false, we render an inline sign-in prompt instead of navigating away.
   */
  redirectUnauthenticated?: boolean;
  showError?: boolean;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredRoles,
  requiredPermission,
  fallbackRoute = '/',
  redirectUnauthenticated = true,
  showError = false
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth state to be determined
    if (isLoading) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      if (redirectUnauthenticated) {
        router.push(fallbackRoute);
      }
      return;
    }

    // Check role requirements
    if (requiredRole && user?.role !== requiredRole) {
      router.push(fallbackRoute);
      return;
    }

    if (requiredRoles && !requiredRoles.some(role => user?.role === role)) {
      router.push(fallbackRoute);
      return;
    }

    // Check permission requirements (simplified for now)
    if (requiredPermission) {
      // TODO: Implement proper permission checking
      router.push(fallbackRoute);
      return;
    }
  }, [
    isAuthenticated, 
    isLoading, 
    requiredRole, 
    requiredRoles, 
    requiredPermission, 
    fallbackRoute,
    redirectUnauthenticated,
    router, 
    user
  ]);

  // Show loading while determining auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-[#F08336]/20 border-t-[#F08336] rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, either redirect (default) or render an inline sign-in prompt.
  if (!isAuthenticated) {
    if (redirectUnauthenticated) return null;

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Sign in required</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Please sign in to view this page.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button
              onClick={() => signIn()}
              className="inline-flex items-center justify-center rounded-lg bg-[#F08336] px-4 py-2 text-white hover:bg-[#E07428] transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={() => router.push(fallbackRoute)}
              className="inline-flex items-center justify-center rounded-lg border px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check role access
  const hasRoleAccess = () => {
    if (requiredRole) return user?.role === requiredRole;
    if (requiredRoles) return requiredRoles.some(role => user?.role === role);
    return true;
  };

  // Check permission access
  const hasPermissionAccess = () => {
    if (!requiredPermission || !user) return true;
    
    // Define permission hierarchy
    const permissionHierarchy: Record<string, string[]> = {
      'property:read': ['user', 'client', 'investor', 'agent', 'admin'],
      'property:create': ['agent', 'admin'],
      'property:update': ['agent', 'admin'],
      'property:delete': ['agent', 'admin'],
      'user:read': ['agent', 'admin'],
      'user:update': ['admin'],
      'user:delete': ['admin'],
      'analytics:read': ['agent', 'admin'],
      'billing:read': ['admin'],
      'billing:manage': ['admin'],
      'system:settings': ['admin'],
    };
    
    const key = `${requiredPermission.resource}:${requiredPermission.action}`;
    const allowedRoles = permissionHierarchy[key] || ['admin'];
    
    return allowedRoles.includes(user.role);
  };

  // Show error page if access denied and showError is true
  if (!hasRoleAccess() || !hasPermissionAccess()) {
    if (showError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5C3.544 17.333 4.506 19 6.046 19z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              You don't have permission to access this page. Please contact an administrator if you believe this is an error.
            </p>
            <button
              onClick={() => router.push(fallbackRoute)}
              className="px-6 py-2 bg-[#F08336] text-white rounded-lg hover:bg-[#E07428] transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  return <>{children}</>;
}

// Higher-order component for easier usage
function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Utility functions for common protection patterns
const requireAgent = (children: ReactNode) => (
  <ProtectedRoute requiredRole="agent">{children}</ProtectedRoute>
);

const requireClient = (children: ReactNode) => (
  <ProtectedRoute requiredRole="client">{children}</ProtectedRoute>
);

const requireInvestor = (children: ReactNode) => (
  <ProtectedRoute requiredRole="investor">{children}</ProtectedRoute>
);

const requireAdmin = (children: ReactNode) => (
  <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
);

const requireAnyRole = (roles: UserRole[], children: ReactNode) => (
  <ProtectedRoute requiredRoles={roles}>{children}</ProtectedRoute>
); 