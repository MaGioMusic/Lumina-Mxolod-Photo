'use client';

import { motion } from 'framer-motion';
import { ClockClockwise, Heart, CalendarCheck, ChatCircleDots, File, UserCircle } from '@phosphor-icons/react';
import type { ProfileActivity } from '@/types/profile';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface ActivityTimelineProps {
  activity: ProfileActivity[];
}

const iconMap: Record<ProfileActivity['type'], React.ReactNode> = {
  favorite_added: <Heart size={18} weight="fill" />,
  favorite_removed: <Heart size={18} weight="regular" />,
  appointment_scheduled: <CalendarCheck size={18} weight="bold" />,
  appointment_completed: <CalendarCheck size={18} weight="fill" />,
  inquiry_sent: <ChatCircleDots size={18} weight="bold" />,
  document_uploaded: <File size={18} weight="bold" />,
  profile_updated: <UserCircle size={18} weight="bold" />,
  system: <ClockClockwise size={18} weight="bold" />,
};

const statusColors: Record<NonNullable<ProfileActivity['status']>, string> = {
  success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-200',
  info: 'bg-sky-500/15 text-sky-600 dark:text-sky-200',
  warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-200',
};

const containerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 0.84, 0.44, 1] as const } },
};

const copy = {
  timelineTitle: { ka: 'აქტივობის ისტორია', en: 'Activity timeline', ru: 'Хроника активности' },
  timelineDescription: {
    ka: 'თანამედროვე მიმოხილვა თქვენი ბოლო ნაბიჯების',
    en: 'Latest highlights from your Lumina journey',
    ru: 'Последние шаги в рамках Lumina',
  },
  empty: {
    ka: 'აქ გამოჩნდება თქვენი აქტივობა',
    en: 'Your activity will appear here',
    ru: 'Здесь появится ваша активность',
  },
};

export function ActivityTimeline({ activity }: ActivityTimelineProps) {
  const { language } = useLanguage();
  const safeLanguage = language === 'ru' ? 'ru' : language === 'en' ? 'en' : 'ka';
  const localize = (key: keyof typeof copy) => copy[key][safeLanguage] ?? copy[key].en;

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_12px_45px_rgba(15,23,42,0.07)] dark:border-slate-800/60 dark:bg-slate-900/70">
      <header className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{localize('timelineTitle')}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{localize('timelineDescription')}</p>
      </header>

      {activity.length === 0 ? (
        <div className="flex h-36 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-500">
          {localize('empty')}
        </div>
      ) : (
        <motion.ol
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative space-y-6 border-l border-slate-200/70 pl-5 dark:border-slate-700/70"
        >
          <span className="absolute left-0 top-0 -translate-x-1/2 rounded-full border border-slate-200/70 bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-400">
            {activity.length} {safeLanguage === 'ru' ? 'событий' : safeLanguage === 'en' ? 'events' : 'ქმედება'}
          </span>
          {activity.map((item) => (
            <motion.li key={item.id} variants={itemVariants} className="relative pl-6">
              <span className="absolute -left-[11px] top-2 flex h-5 w-5 items-center justify-center rounded-full border border-amber-200 bg-amber-400 text-white shadow-[0_6px_18px_rgba(245,158,11,0.3)] dark:border-slate-800">
                {iconMap[item.type]}
              </span>
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.07)] dark:border-slate-800/60 dark:bg-slate-900/70">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                    {item.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                    )}
                  </div>
                  {item.status && (
                    <span className={cn('rounded-full px-3 py-1 text-xs font-medium', statusColors[item.status])}>
                      {item.status === 'success'
                        ? safeLanguage === 'ru'
                          ? 'Успех'
                          : safeLanguage === 'en'
                          ? 'Success'
                          : 'წარმატებით'
                        : item.status === 'info'
                        ? safeLanguage === 'ru'
                          ? 'Инфо'
                          : safeLanguage === 'en'
                          ? 'Info'
                          : 'ინფო'
                        : safeLanguage === 'ru'
                        ? 'Внимание'
                        : safeLanguage === 'en'
                        ? 'Warning'
                        : 'გაფრთხილება'}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <time dateTime={item.timestamp}>{new Date(item.timestamp).toLocaleString(language)}</time>
                  {item.property && (
                    <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs text-amber-600 dark:text-amber-200">
                      {item.property.title}
                    </span>
                  )}
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      )}
    </section>
  );
}


