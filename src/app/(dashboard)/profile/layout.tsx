'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute
      requiredRoles={['user', 'client', 'investor', 'agent', 'admin']}
      fallbackRoute="/"
      redirectUnauthenticated={false}
    >
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Profile Dashboard" />
          <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}









