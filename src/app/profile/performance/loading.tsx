'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_12px_45px_rgba(15,23,42,0.07)]">
      <Skeleton className="h-6 w-52 rounded-full" />
      <Skeleton className="mt-2 h-4 w-64 rounded-full" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)]">
        <Skeleton className="h-56 rounded-[24px]" />
        <div className="space-y-4">
          <Skeleton className="h-20 rounded-[24px]" />
          <Skeleton className="h-20 rounded-[24px]" />
        </div>
      </div>
    </div>
  );
}








