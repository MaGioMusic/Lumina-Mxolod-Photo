'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Star,
  Funnel,
  CalendarBlank,
  ChatsCircle,
  Files,
  MapPin,
  Clock,
  DownloadSimple,
} from '@phosphor-icons/react';
import { useLanguage } from '@/contexts/LanguageContext';
import type {
  ProfileAppointment,
  ProfileDocument,
  ProfileInquiry,
  ProfilePropertySummary,
  ProfileSavedSearch,
} from '@/types/profile';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type TabKey = 'favorites' | 'searches' | 'appointments' | 'inquiries' | 'documents';

interface ProfileTabsProps {
  favorites: ProfilePropertySummary[];
  savedSearches: ProfileSavedSearch[];
  appointments: ProfileAppointment[];
  inquiries: ProfileInquiry[];
  documents: ProfileDocument[];
}

const copy = {
  tab_favorites: { ka: 'რჩეულები', en: 'Favorites', ru: 'Избранное' },
  tab_saved_searches: { ka: 'შენახული ძიებები', en: 'Saved searches', ru: 'Сохранённые поиски' },
  tab_appointments: { ka: 'დაგეგმილი ვიზიტები', en: 'Appointments', ru: 'Визиты' },
  tab_inquiries: { ka: 'მოთხოვნები', en: 'Inquiries', ru: 'Запросы' },
  tab_documents: { ka: 'დოკუმენტები', en: 'Documents', ru: 'Документы' },
  results: { ka: 'შედეგი', en: 'results', ru: 'результатов' },
  created: { ka: 'შექმნილი', en: 'Created', ru: 'Создано' },
  lastRun: { ka: 'ბოლო გაშვება', en: 'Last run', ru: 'Последний запуск' },
  noFavorites: { ka: 'ჯერ არ გაქვთ რჩეული ქონებები', en: 'No favorites yet', ru: 'Избранных объектов пока нет' },
  noSavedSearches: { ka: 'შენახული ძიებები არ მოიძებნა', en: 'No saved searches', ru: 'Сохранённых поисков нет' },
  noAppointments: { ka: 'გრაფიკში ჯერ არ არის ვიზიტები', en: 'No appointments scheduled', ru: 'Нет запланированных визитов' },
  noInquiries: { ka: 'ჯერ არ მიგიძლინიათ მოთხოვნა', en: 'No inquiries yet', ru: 'Запросов пока нет' },
  noDocuments: { ka: 'დოკუმენტები არ არის ატვირთული', en: 'No documents available', ru: 'Документы отсутствуют' },
  responded: { ka: 'პასუხი გაგზავნილია', en: 'Responded', ru: 'Ответ отправлен' },
  agent: { ka: 'აგენტა', en: 'Agent', ru: 'Агент' },
  download: { ka: 'ჩამოტვირთვა', en: 'Download', ru: 'Скачать' },
};

const tabsConfig: Record<
  TabKey,
  {
    icon: React.ReactNode;
    copyKey: keyof typeof copy;
    description: string;
  }
> = {
  favorites: {
    icon: <Star size={18} weight="fill" />,
    copyKey: 'tab_favorites',
    description: 'თქვენი რჩეული განცხადებები',
  },
  searches: {
    icon: <Funnel size={18} weight="bold" />,
    copyKey: 'tab_saved_searches',
    description: 'შენახული ფილტრები და ალერტები',
  },
  appointments: {
    icon: <CalendarBlank size={18} weight="bold" />,
    copyKey: 'tab_appointments',
    description: 'დაგეგმილი ტურნეები და შეხვედრები',
  },
  inquiries: {
    icon: <ChatsCircle size={18} weight="bold" />,
    copyKey: 'tab_inquiries',
    description: 'შეკითხვები აგენტებთან',
  },
  documents: {
    icon: <Files size={18} weight="bold" />,
    copyKey: 'tab_documents',
    description: 'ხელშეკრულებები და ფაილები',
  },
};

const tabOrder: TabKey[] = ['favorites', 'searches', 'appointments', 'inquiries', 'documents'];

const tabContentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export function ProfileTabs({
  favorites,
  savedSearches,
  appointments,
  inquiries,
  documents,
}: ProfileTabsProps) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabKey>('favorites');

  const safeLanguage = language === 'ru' ? 'ru' : language === 'en' ? 'en' : 'ka';
  const localize = (key: keyof typeof copy) => copy[key][safeLanguage] ?? copy[key].en;

  const locale = useMemo(() => {
    if (language === 'en') return 'en-US';
    if (language === 'ru') return 'ru-RU';
    return 'ka-GE';
  }, [language]);

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'GEL',
        minimumFractionDigits: 0,
      }),
    [locale]
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'favorites':
        return (
          <motion.div
            key="favorites"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {favorites.map((property) => (
              <motion.article
                key={property.id}
                whileHover={{ y: -4 }}
                className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_14px_45px_rgba(15,23,42,0.07)] dark:border-slate-800/50 dark:bg-slate-900/60"
              >
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={property.thumbnailUrl}
                    alt={property.title}
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {property.isNew && (
                    <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                      {t('new') ?? 'New'}
                    </span>
                  )}
                </div>
                <div className="space-y-3 px-4 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      {property.title}
                    </h3>
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
                      {t(property.status) ?? property.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    <MapPin size={16} weight="bold" className="mr-1 inline-block text-amber-500" />
                    {property.addressLine ?? property.city}
                  </p>
                  <div className="flex items-end justify-between gap-3">
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {formatter.format(property.price)}
                    </p>
                    <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>{property.bedrooms} bd</span>
                      <span>{property.bathrooms} ba</span>
                      <span>{property.area} მ²</span>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
            {favorites.length === 0 && <EmptyState message={localize('noFavorites')} />}
          </motion.div>
        );
      case 'searches':
        return (
          <motion.div
            key="searches"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            {savedSearches.map((search) => (
              <div
                key={search.id}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.07)] dark:border-slate-800/60 dark:bg-slate-900/60"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      {search.name}
                    </h3>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                      {formatter.format(search.filters?.min_price as number ?? 0)} ·{' '}
                      {String(search.filters?.district ?? '')}
                    </p>
                  </div>
                  {search.totalMatches !== undefined && (
                    <span className="rounded-full bg-slate-900/90 px-3 py-1 text-xs font-medium text-white dark:bg-white/90 dark:text-slate-900">
                    {search.totalMatches} {localize('results')}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(search.filters ?? {}).map(([key, value]) => (
                    <span
                      key={`${search.id}-${key}`}
                      className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-600 dark:text-amber-200"
                    >
                      {key}: {Array.isArray(value) ? value.join(', ') : String(value)}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    {localize('created')}:{' '}
                    {new Date(search.createdAt).toLocaleDateString(language)}
                  </span>
                  {search.lastRunAt && (
                    <span>
                      {localize('lastRun')}:{' '}
                      {new Date(search.lastRunAt).toLocaleDateString(language)}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {savedSearches.length === 0 && <EmptyState message={localize('noSavedSearches')} />}
          </motion.div>
        );
      case 'appointments':
        return (
          <motion.div
            key="appointments"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            {appointments.map((appointment) => (
              <motion.div
                key={appointment.id}
                whileHover={{ y: -3 }}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.07)] dark:border-slate-800/60 dark:bg-slate-900/60"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      {appointment.property.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      <MapPin size={16} weight="bold" className="mr-1 inline-block text-amber-500" />
                      {appointment.property.addressLine ?? appointment.property.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('rounded-full px-3 py-1 text-xs font-medium', statusClass(appointment.status))}>
                      {t(appointment.status) ?? appointment.status}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
                      {t(appointment.type) ?? appointment.type}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    <Clock size={14} weight="bold" className="mr-1 inline-block text-amber-500" />
                    {new Date(appointment.scheduledAt).toLocaleString(language)}
                  </span>
                  {appointment.meetingLocation && (
                    <span>{appointment.meetingLocation}</span>
                  )}
                  {appointment.agent && (
                    <span>
                      {localize('agent')}: {appointment.agent.name}
                    </span>
                  )}
                </div>
                {appointment.notes && (
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{appointment.notes}</p>
                )}
              </motion.div>
            ))}
            {appointments.length === 0 && <EmptyState message={localize('noAppointments')} />}
          </motion.div>
        );
      case 'inquiries':
        return (
          <motion.div
            key="inquiries"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            {inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.07)] dark:border-slate-800/60 dark:bg-slate-900/60"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      {inquiry.property.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{inquiry.message}</p>
                  </div>
                  <span className={cn('rounded-full px-3 py-1 text-xs font-medium', inquiryStatusClass(inquiry.status))}>
                    {t(inquiry.status) ?? inquiry.status}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span>{new Date(inquiry.createdAt).toLocaleString(language)}</span>
                  {inquiry.respondedAt && (
                    <span>
                      {localize('responded')}:{' '}
                      {new Date(inquiry.respondedAt).toLocaleString(language)}
                    </span>
                  )}
                  {inquiry.agent && <span>{inquiry.agent.name}</span>}
                </div>
              </div>
            ))}
            {inquiries.length === 0 && <EmptyState message={localize('noInquiries')} />}
          </motion.div>
        );
      case 'documents':
        return (
          <motion.div
            key="documents"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.07)] dark:border-slate-800/60 dark:bg-slate-900/60"
              >
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">{doc.name}</h3>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                    {doc.category} · {new Date(doc.updatedAt).toLocaleDateString(language)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('rounded-full px-3 py-1 text-xs font-medium', documentStatusClass(doc.status))}>
                    {t(doc.status) ?? doc.status}
                  </span>
                  {doc.downloadUrl && (
                    <a
                      href={doc.downloadUrl}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-amber-400 hover:text-amber-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
                    >
                      <DownloadSimple size={16} weight="bold" /> {t('download') ?? 'Download'}
                    </a>
                  )}
                </div>
              </div>
            ))}
            {documents.length === 0 && <EmptyState message={localize('noDocuments')} />}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800/50 dark:bg-slate-900/70">
        {tabOrder.map((tabKey) => {
          const tabConfig = tabsConfig[tabKey];
          const isActive = activeTab === tabKey;
          return (
            <button
              key={tabKey}
              type="button"
              onClick={() => setActiveTab(tabKey)}
              className={cn(
                'relative flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 md:px-4 md:text-sm',
                isActive ? 'text-slate-900 dark:text-white' : ''
              )}
            >
              <span>{tabConfig.icon}</span>
              <span>{localize(tabConfig.copyKey)}</span>
              {isActive && (
                <motion.span
                  layoutId="profile-tab-highlight"
                  className="absolute inset-0 -z-10 rounded-xl bg-white/90 shadow-[0_8px_25px_rgba(15,23,42,0.12)] dark:bg-slate-800/80"
                  transition={{ type: 'spring', stiffness: 220, damping: 28 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_16px_55px_rgba(15,23,42,0.08)] dark:border-slate-800/50 dark:bg-slate-900/70">
        <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
      </div>
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-500">
      {message}
    </div>
  );
}

const statusClass = (status: ProfileAppointment['status']) =>
  cn(
    'border text-xs font-medium',
    status === 'confirmed'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-200'
      : status === 'scheduled'
      ? 'border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-500/30 dark:bg-sky-500/20 dark:text-sky-200'
      : status === 'completed'
      ? 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200'
      : 'border-rose-200 bg-rose-50 text-rose-500 dark:border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-200'
  );

const inquiryStatusClass = (status: ProfileInquiry['status']) =>
  cn(
    'border text-xs font-medium',
    status === 'responded'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-200'
      : status === 'in_progress'
      ? 'border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-500/30 dark:bg-sky-500/20 dark:text-sky-200'
      : status === 'closed'
      ? 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200'
      : 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-200'
  );

const documentStatusClass = (status: ProfileDocument['status']) =>
  cn(
    'border text-xs font-medium',
    status === 'completed'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-200'
      : status === 'pending'
      ? 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-200'
      : 'border-rose-200 bg-rose-50 text-rose-500 dark:border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-200'
  );


