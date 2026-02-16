'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ProfileInquiry } from '@/types/profile';
import { cn } from '@/lib/utils';

interface InquiriesSectionProps {
  inquiries: ProfileInquiry[];
}

const copy = {
  title: { ka: 'მოთხოვნები', en: 'Client inquiries', ru: 'Клиентские запросы' },
  subtitle: {
    ka: 'აგენტთან მიმდინარე კომუნიკაცია',
    en: 'Active conversations with your agent',
    ru: 'Активные диалоги с агентом',
  },
  responded: { ka: 'პასუხი გაგზავნილია', en: 'Responded', ru: 'Ответ отправлен' },
  empty: {
    ka: 'ჯერ არ მიგზავნია მოთხოვნა.',
    en: 'No inquiries yet.',
    ru: 'Запросов пока нет.',
  },
};

const statusClass = (status: ProfileInquiry['status']) =>
  cn(
    'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
    status === 'responded'
      ? 'border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-200'
      : status === 'in_progress'
      ? 'border border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-500/30 dark:bg-sky-500/20 dark:text-sky-200'
      : status === 'closed'
      ? 'border border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200'
      : 'border border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-200'
  );

export function InquiriesSection({ inquiries }: InquiriesSectionProps) {
  const { language, t } = useLanguage();
  const safeLanguage = language === 'ru' ? 'ru' : language === 'en' ? 'en' : 'ka';

  return (
    <section
      id="inquiries"
      className="space-y-4 rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_12px_45px_rgba(15,23,42,0.07)] dark:border-slate-800/60 dark:bg-slate-900/75 sm:p-7"
    >
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{copy.title[safeLanguage]}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{copy.subtitle[safeLanguage]}</p>
      </header>

      {inquiries.length === 0 ? (
        <div className="flex h-36 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/70 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-500">
          {copy.empty[safeLanguage]}
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <motion.article
              key={inquiry.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] dark:border-slate-800/60 dark:bg-slate-900/70"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    {inquiry.property.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{inquiry.message}</p>
                </div>
                <span className={statusClass(inquiry.status)}>{t(inquiry.status) ?? inquiry.status}</span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>{new Date(inquiry.createdAt).toLocaleString(language)}</span>
                {inquiry.respondedAt && (
                  <span>
                    {copy.responded[safeLanguage]} · {new Date(inquiry.respondedAt).toLocaleString(language)}
                  </span>
                )}
                {inquiry.agent && <span>{inquiry.agent.name}</span>}
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  );
}


