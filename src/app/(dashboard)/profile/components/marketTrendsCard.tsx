'use client';

import { useMemo } from 'react';
import { TrendUp } from '@phosphor-icons/react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ProfilePropertySummary } from '@/types/profile';

interface MarketTrendsCardProps {
  favorites: ProfilePropertySummary[];
}

const copy = {
  title: { ka: 'საბაზრო ტენდენციები', en: 'Market trends', ru: 'Рыночные тренды' },
  subtitle: {
    ka: 'საშუალო ფასები შერჩეულ უბნებში',
    en: 'Average prices across your focus districts',
    ru: 'Средние цены по выбранным районам',
  },
  currencySuffix: { ka: '₾', en: '₾', ru: '₾' },
};

const districtLabels: Record<string, { ka: string; en: string; ru: string }> = {
  vake: { ka: 'ვაკე', en: 'Vake', ru: 'Ваке' },
  isani: { ka: 'ისანი', en: 'Isani', ru: 'Исани' },
  saburtalo: { ka: 'საბურთალო', en: 'Saburtalo', ru: 'Сабуртало' },
  gldani: { ka: 'გლდანი', en: 'Gldani', ru: 'Глдани' },
  mtatsminda: { ka: 'მთაწმინდა', en: 'Mtatsminda', ru: 'Мтатсминда' },
};

export function MarketTrendsCard({ favorites }: MarketTrendsCardProps) {
  const { language } = useLanguage();
  const safeLanguage = language === 'ru' ? 'ru' : language === 'en' ? 'en' : 'ka';

  const grouped = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    favorites.forEach((property) => {
      const key = property.district ?? 'other';
      const entry = map.get(key) ?? { total: 0, count: 0 };
      entry.total += property.price;
      entry.count += 1;
      map.set(key, entry);
    });
    return Array.from(map.entries())
      .map(([district, value]) => ({
        district,
        average: value.total / Math.max(1, value.count),
        count: value.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [favorites]);

  const maxAverage = Math.max(...grouped.map((item) => item.average), 1);

  return (
    <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_12px_45px_rgba(15,23,42,0.07)] dark:border-slate-800/60 dark:bg-slate-900/75 sm:p-7">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{copy.title[safeLanguage]}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{copy.subtitle[safeLanguage]}</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-200">
          <TrendUp size={16} weight="bold" />
          +5%
        </span>
      </header>

      {grouped.length === 0 ? (
        <div className="mt-6 flex h-28 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/70 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-500">
          {safeLanguage === 'ru'
            ? 'Недостаточно данных для аналитики.'
            : safeLanguage === 'en'
            ? 'Not enough data to show market insights yet.'
            : 'ანალიტიკის საჩვენებლად მეტი მონაცემია საჭირო.'}
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {grouped.map((item) => {
            const label = districtLabels[item.district]?.[safeLanguage] ?? item.district;
            const percentage = Math.max(12, (item.average / maxAverage) * 100);
            return (
              <div key={item.district}>
                <div className="flex items-center justify-between text-sm font-semibold text-slate-600 dark:text-slate-300">
                  <span>{label}</span>
                  <span>
                    {(item.average / 1000).toFixed(0)}k {copy.currencySuffix[safeLanguage]}
                  </span>
                </div>
                <div className="mt-2 h-3 rounded-full bg-slate-100 dark:bg-slate-800/70">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#F08336] via-amber-400 to-emerald-400"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  {item.count} {safeLanguage === 'ru' ? 'об.' : safeLanguage === 'en' ? 'listings' : 'განცხადება'}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}


