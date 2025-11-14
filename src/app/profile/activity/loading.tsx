'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_12px_45px_rgba(15,23,42,0.07)]">
      <Skeleton className="h-6 w-40 rounded-full" />
      <Skeleton className="mt-2 h-4 w-64 rounded-full" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="mt-1 h-5 w-5 rounded-full" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}








