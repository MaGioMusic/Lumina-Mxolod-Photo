import Link from 'next/link';
import { Wrench } from 'lucide-react';

interface UnderConstructionProps {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}

export function UnderConstruction({
  title = 'Under Construction',
  description = 'This page is being rebuilt. Please check back soon.',
  backHref = '/',
  backLabel = 'Go back home',
}: UnderConstructionProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">
      <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-amber-200/30 blur-3xl dark:bg-amber-500/10" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-500/10" />

      <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/25">
          <Wrench className="h-7 w-7" aria-hidden="true" />
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
          {description}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={backHref}
            className="inline-flex items-center justify-center rounded-xl bg-[#F08336] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e0743a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F08336]/60 focus-visible:ring-offset-2"
          >
            {backLabel}
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}

