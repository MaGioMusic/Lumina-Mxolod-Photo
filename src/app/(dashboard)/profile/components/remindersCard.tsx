'use client';

import { CalendarBlank, TagSimple } from '@phosphor-icons/react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ProfileAppointment, ProfileNotification } from '@/types/profile';

interface RemindersCardProps {
  appointments: ProfileAppointment[];
  notifications: ProfileNotification[];
}

const copy = {
  title: { ka: 'შეხსენებები', en: 'Reminders', ru: 'Напоминания' },
  subtitle: {
    ka: 'საახლოვო ვიზიტები და ფასის ცვლილებები',
    en: 'Upcoming tours and price updates',
    ru: 'Ближайшие показы и изменения цен',
  },
  tour: { ka: 'ტური', en: 'Tour', ru: 'Показ' },
  today: { ka: 'დღეს', en: 'Today', ru: 'Сегодня' },
  inDays: { ka: 'დღეში', en: 'in', ru: 'через' },
  priceDrop: { ka: 'ფასის ცვლილება', en: 'Price change', ru: 'Изменение цены' },
  noReminders: {
    ka: 'ამ დროისთვის აქტიური შეხსენებები არ არის.',
    en: 'No reminders right now.',
    ru: 'Напоминаний нет.',
  },
};

export function RemindersCard({ appointments, notifications }: RemindersCardProps) {
  const { language } = useLanguage();
  const safeLanguage = language === 'ru' ? 'ru' : language === 'en' ? 'en' : 'ka';

  const now = new Date();
  const upcomingAppointment = appointments
    .map((appointment) => ({ ...appointment, date: new Date(appointment.scheduledAt) }))
    .filter((appointment) => appointment.date.getTime() >= now.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

  const priceChange = notifications.find((notification) => notification.type === 'price_change');

  return (
    <section className="space-y-4 rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_12px_45px_rgba(15,23,42,0.07)] dark:border-slate-800/60 dark:bg-slate-900/75 sm:p-7">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{copy.title[safeLanguage]}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{copy.subtitle[safeLanguage]}</p>
      </header>

      {!upcomingAppointment && !priceChange ? (
        <div className="flex h-28 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/70 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-500">
          {copy.noReminders[safeLanguage]}
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingAppointment && (
            <ReminderRow
              icon={<CalendarBlank size={18} weight="bold" className="text-sky-500" />}
              title={`${copy.tour[safeLanguage]} · ${upcomingAppointment.property.title}`}
              description={upcomingAppointment.meetingLocation ?? upcomingAppointment.property.addressLine ?? ''}
              timestamp={formatRelative(upcomingAppointment.date, language)}
            />
          )}
          {priceChange && (
            <ReminderRow
              icon={<TagSimple size={18} weight="bold" className="text-amber-500" />}
              title={`${copy.priceDrop[safeLanguage]} · ${priceChange.title}`}
              description={priceChange.message}
              timestamp={new Date(priceChange.createdAt).toLocaleString(language)}
            />
          )}
        </div>
      )}
    </section>
  );
}

function ReminderRow({
  icon,
  title,
  description,
  timestamp,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string | null;
  timestamp: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_12px_35px_rgba(15,23,42,0.07)] dark:border-slate-800/60 dark:bg-slate-900/70">
      <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-200">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{description}</p>
        )}
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{timestamp}</p>
      </div>
    </div>
  );
}

function formatRelative(date: Date, locale: string) {
  const diff = date.getTime() - Date.now();
  const days = Math.round(diff / (24 * 3600 * 1000));
  const formatter = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  if (Math.abs(days) <= 1) {
    return formatter.format(date);
  }
  return formatter.format(date);
}


