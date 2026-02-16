'use client';

import { DownloadSimple } from '@phosphor-icons/react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ProfileDocument } from '@/types/profile';
import { cn } from '@/lib/utils';

interface DocumentsSectionProps {
  documents: ProfileDocument[];
}

const copy = {
  title: { ka: 'დოკუმენტები', en: 'Documents', ru: 'Документы' },
  subtitle: {
    ka: 'ხელშეკრულებები და ფაილები სწრაფი წვდომისთვის',
    en: 'Contracts and paperwork within reach',
    ru: 'Договоры и файлы под рукой',
  },
  empty: {
    ka: 'დოკუმენტები ჯერ არ არის ატვირთული.',
    en: 'No documents available yet.',
    ru: 'Документы пока не загружены.',
  },
  download: { ka: 'ჩამოტვირთვა', en: 'Download', ru: 'Скачать' },
};

const statusClass = (status: ProfileDocument['status']) =>
  cn(
    'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
    status === 'completed'
      ? 'border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-200'
      : status === 'pending'
      ? 'border border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-200'
      : 'border border-rose-200 bg-rose-50 text-rose-500 dark:border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-200'
  );

export function DocumentsSection({ documents }: DocumentsSectionProps) {
  const { language } = useLanguage();
  const safeLanguage = language === 'ru' ? 'ru' : language === 'en' ? 'en' : 'ka';

  return (
    <section
      id="documents"
      className="space-y-5 rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_12px_45px_rgba(15,23,42,0.07)] dark:border-slate-800/60 dark:bg-slate-900/75 sm:p-7"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{copy.title[safeLanguage]}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{copy.subtitle[safeLanguage]}</p>
        </div>
        {documents.length > 0 && (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
            {documents.length}
          </span>
        )}
      </header>

      {documents.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/70 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-500">
          {copy.empty[safeLanguage]}
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((document) => (
            <article
              key={document.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] dark:border-slate-800/60 dark:bg-slate-900/70"
            >
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">{document.name}</h3>
                <p className="text-xs uppercase tracking-[0.26em] text-slate-400 dark:text-slate-500">
                  {document.category} · {new Date(document.updatedAt).toLocaleDateString(language)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={statusClass(document.status)}>
                  {document.status === 'completed'
                    ? safeLanguage === 'ru'
                      ? 'Готово'
                      : safeLanguage === 'en'
                      ? 'Completed'
                      : 'დასრულდა'
                    : document.status === 'pending'
                    ? safeLanguage === 'ru'
                      ? 'В процессе'
                      : safeLanguage === 'en'
                      ? 'Pending'
                      : 'მიმდინარეობს'
                    : safeLanguage === 'ru'
                    ? 'Истёк'
                    : safeLanguage === 'en'
                    ? 'Expired'
                    : 'გადაცილდა'}
                </span>
                {document.downloadUrl && (
                  <a
                    href={document.downloadUrl}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-[#F08336]/40 hover:text-[#F08336] dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200"
                  >
                    <DownloadSimple size={16} weight="bold" />
                    {copy.download[safeLanguage]}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}


