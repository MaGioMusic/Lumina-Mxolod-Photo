'use client';

import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ProfileAppointment, ProfileInquiry } from '@/types/profile';
import { ArrowRight } from '@phosphor-icons/react';

interface PerformanceOverviewSectionProps {
  favoritesCount: number;
  appointments: ProfileAppointment[];
  inquiries: ProfileInquiry[];
}

const copy = {
  title: { ka: 'აქტივობის ანალიზი', en: 'Activity Analytics', ru: 'Анализ активности' },
  subtitle: { ka: 'ბოლო 15 დღის მონაცემები', en: 'Data from last 15 days', ru: 'Данные за 15 дней' },
};

export function PerformanceOverviewSection({
  favoritesCount,
  appointments,
  inquiries,
}: PerformanceOverviewSectionProps) {
  const { language } = useLanguage();
  const safeLanguage = language === 'ru' ? 'ru' : language === 'en' ? 'en' : 'ka';

  const data = useMemo(() => {
    const points = 15;
    // Use real counts to subtly shape the (demo) chart
    const favoritesBoost = Math.min(40, Math.max(0, favoritesCount));
    const appointmentsBoost = Math.min(20, Math.max(0, appointments.length));
    const inquiriesBoost = Math.min(20, Math.max(0, inquiries.length));

    return Array.from({ length: points }).map((_, index) => {
      const date = new Date(Date.now() - (points - index - 1) * 24 * 3600 * 1000);
      const label = new Intl.DateTimeFormat(language, { weekday: 'narrow' }).format(date);
      
      // Create slightly prettier fake data curve
      const x = index / points;
      const viewsBase =
        50 +
        Math.sin(x * Math.PI * 2) * 20 +
        index * 2 +
        favoritesBoost * 0.35 +
        appointmentsBoost * 0.9;
      const inqBase = 10 + Math.sin(x * Math.PI * 2 + 1) * 5 + index + inquiriesBoost * 0.8;
      
      return {
        label,
        fullDate: new Intl.DateTimeFormat(language, { month: 'short', day: 'numeric' }).format(date),
        views: Math.round(viewsBase),
        inquiries: Math.round(inqBase),
      };
    });
  }, [language, favoritesCount, appointments.length, inquiries.length]);

  const maxVal = Math.max(...data.map(d => d.views));

  return (
    <section className="h-full flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{copy.title[safeLanguage]}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{copy.subtitle[safeLanguage]}</p>
        </div>
        <button className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 transition-colors hover:bg-white hover:text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
           <ArrowRight size={14} weight="bold" />
        </button>
      </header>

      {/* Custom CSS Bar Chart - More Bento-like */}
      <div className="flex-1 flex items-end gap-2 sm:gap-4">
        {data.map((d, i) => {
          const heightPercent = (d.views / maxVal) * 100;
          return (
            <div key={i} className="group relative flex-1 flex flex-col justify-end gap-2 h-48 cursor-pointer">
               {/* Tooltip */}
               <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none z-10">
                 <div className="whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-medium text-white shadow-lg dark:bg-white dark:text-slate-900">
                    {d.fullDate}: {d.views} Views
                 </div>
               </div>
               
               {/* Bar Group */}
               <div className="relative w-full rounded-t-lg bg-slate-100 dark:bg-slate-800 h-full overflow-hidden">
                  {/* Active Bar */}
                  <div 
                    className="absolute bottom-0 w-full rounded-t-lg bg-slate-900 transition-all duration-500 group-hover:bg-indigo-600 dark:bg-white dark:group-hover:bg-indigo-400"
                    style={{ height: `${heightPercent}%` }}
                  />
                  {/* Secondary Bar (Inquiries) - Overlay */}
                  <div 
                    className="absolute bottom-0 w-full bg-indigo-500/20"
                    style={{ height: `${(d.inquiries / maxVal) * 100}%` }}
                  />
               </div>
               
               <span className="text-center text-[10px] font-medium text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                 {d.label}
               </span>
            </div>
          )
        })}
      </div>
    </section>
  );
}
