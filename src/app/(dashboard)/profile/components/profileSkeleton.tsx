'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-8 xl:grid xl:grid-cols-[260px_minmax(0,1fr)]">
      <div className="hidden xl:flex min-w-[200px] flex-col justify-between rounded-[28px] border border-slate-100 bg-white px-4 py-6 shadow-[0_18px_70px_rgba(15,23,42,0.08)] dark:border-slate-800/50 dark:bg-slate-900/70">
        <Skeleton className="h-8 w-32 rounded-full" />
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, groupIdx) => (
            <div key={`nav-group-${groupIdx}`} className="space-y-3">
              <Skeleton className="h-3 w-20 rounded-full" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((__, itemIdx) => (
                  <div key={`nav-item-${groupIdx}-${itemIdx}`} className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-xl" />
                    <Skeleton className="h-4 w-24 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-auto space-y-3 rounded-3xl border border-slate-100 bg-white p-4 dark:border-slate-800/60 dark:bg-slate-900/75">
          <Skeleton className="h-11 w-11 rounded-2xl" />
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
      </div>

      <div className="space-y-8">
        <div className="rounded-[42px] border border-slate-100 bg-white p-8 shadow-[0_24px_110px_rgba(15,23,42,0.12)] dark:border-slate-800/60 dark:bg-slate-900/75">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-5">
              <Skeleton className="h-24 w-24 rounded-3xl" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-32 rounded-full" />
                <Skeleton className="h-8 w-56 rounded-full" />
                <Skeleton className="h-4 w-64 rounded-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-28 rounded-full" />
                  <Skeleton className="h-6 w-28 rounded-full" />
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:w-[340px]">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={`metric-skeleton-${idx}`} className="rounded-3xl border border-white/40 bg-white/80 p-4 dark:border-slate-800/60 dark:bg-slate-900/70">
                  <Skeleton className="h-3 w-20 rounded-full" />
                  <Skeleton className="mt-3 h-6 w-16 rounded-full" />
                  <Skeleton className="mt-5 h-3 w-24 rounded-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-12 rounded-2xl" />
            <Skeleton className="h-12 rounded-2xl" />
            <Skeleton className="h-12 rounded-2xl" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-12 rounded-2xl" />
            <Skeleton className="h-12 rounded-2xl" />
            <Skeleton className="h-12 rounded-2xl" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`stat-skeleton-${index}`}
              className="rounded-2xl border border-white/25 bg-white/70 p-5 backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/70"
            >
              <Skeleton className="h-3 w-20 rounded-full" />
              <Skeleton className="mt-3 h-7 w-24 rounded-full" />
              <Skeleton className="mt-6 h-3 w-32 rounded-full" />
            </div>
          ))}
        </div>

        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.95fr)_minmax(0,1.05fr)]">
          <div className="space-y-6">
            <div className="rounded-[36px] border border-slate-100 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.1)] dark:border-slate-800/60 dark:bg-slate-900/75">
              <Skeleton className="h-6 w-40 rounded-full" />
              <Skeleton className="mt-2 h-4 w-64 rounded-full" />
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Skeleton key={`listing-skeleton-${idx}`} className="h-52 rounded-3xl" />
                ))}
              </div>
            </div>

            <div className="rounded-[36px] border border-slate-100 bg-white p-6 shadow-[0_18px_65px_rgba(15,23,42,0.1)] dark:border-slate-800/60 dark:bg-slate-900/75">
              <Skeleton className="h-6 w-48 rounded-full" />
              <Skeleton className="mt-2 h-4 w-40 rounded-full" />
              <Skeleton className="mt-6 h-40 rounded-3xl" />
            </div>

            <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_16px_60px_rgba(15,23,42,0.1)] dark:border-slate-800/60 dark:bg-slate-900/75">
              <Skeleton className="h-6 w-40 rounded-full" />
              <Skeleton className="mt-2 h-4 w-60 rounded-full" />
              <div className="mt-5 space-y-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Skeleton key={`saved-search-${idx}`} className="h-16 rounded-2xl" />
                ))}
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Skeleton className="h-48 rounded-[32px]" />
              <Skeleton className="h-48 rounded-[32px]" />
            </div>

            <Skeleton className="h-48 rounded-[32px]" />
          </div>

          <div className="space-y-6">
            <Skeleton className="h-44 rounded-[32px]" />
            <Skeleton className="h-44 rounded-[32px]" />
            <Skeleton className="h-28 rounded-[32px]" />
            <Skeleton className="h-40 rounded-[32px]" />
            <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_16px_60px_rgba(15,23,42,0.1)] dark:border-slate-800/60 dark:bg-slate-900/75">
              <Skeleton className="h-5 w-40 rounded-full" />
              <div className="mt-4 space-y-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={`activity-skeleton-${idx}`} className="flex gap-3">
                    <Skeleton className="mt-1 h-4 w-4 rounded-full" />
                    <Skeleton className="h-16 w-full rounded-2xl" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


