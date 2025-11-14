'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_12px_45px_rgba(15,23,42,0.07)]">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-6 w-40 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-[24px]" />
        ))}
      </div>
    </div>
  );
}








