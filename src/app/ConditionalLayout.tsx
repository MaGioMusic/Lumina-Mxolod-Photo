'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import StickyCompareBar from '@/components/StickyCompareBar';
import { logger } from '@/lib/logger';
import { ProfiledSection } from '@/lib/perf/reactProfiler';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Debug: Log current pathname (dev only)
  logger.log('ConditionalLayout pathname:', pathname);

  const normalizedPathname = pathname?.replace(/^\/(ka|en|ru)(?=\/)/, '') ?? '';
  const isComparePage = normalizedPathname.startsWith('/compare');

  return (
    <>
      <ProfiledSection id="Header">
        <Header />
      </ProfiledSection>
      <ProfiledSection id="MainContent">
        <main className="min-h-screen">
          <div style={{ ['--app-header-height' as string]: '5rem' }}>
            {children}
          </div>
        </main>
      </ProfiledSection>
      {/* Sticky Compare Bar (hide on /compare) */}
      {!isComparePage && (
        <ProfiledSection id="StickyCompareBar">
          <StickyCompareBar />
        </ProfiledSection>
      )}
      {/* Global AI Chat - visible on all pages */}
      {/* Chat mounted globally in Root layout */}
    </>
  );
} 