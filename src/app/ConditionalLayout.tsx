'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import StickyCompareBar from '@/components/StickyCompareBar';
import { logger } from '@/lib/logger';

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
      <Header />
      <main className="min-h-screen">
        <div style={{ ['--app-header-height' as string]: '5rem' }}>
          {children}
        </div>
      </main>
      {/* Sticky Compare Bar (hide on /compare) */}
      {!isComparePage && <StickyCompareBar />}
      {/* Global AI Chat - visible on all pages */}
      {/* Chat mounted globally in Root layout */}
    </>
  );
} 