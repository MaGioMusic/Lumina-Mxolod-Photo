'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import Image from 'next/image';
import { MapPin, DotsThreeOutline, CaretDown } from '@phosphor-icons/react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ProfilePropertySummary } from '@/types/profile';

interface MyListingsSectionProps {
  listings: ProfilePropertySummary[];
}

const copy = {
  title: { ka: 'ჩემი განცხადებები', en: 'My listings', ru: 'Мои объявления' },
  subtitle: {
    ka: 'შენი ფავორიტები და მონიტორინგის ქონებები ერთ სივრცეში',
    en: 'Your curated homes and monitored listings in one place',
    ru: 'Ваши избранные и отслеживаемые объекты в одном месте',
  },
  empty: {
    ka: 'ჯერ არ გაქვს შენახული ქონებები. დაიწყე ძიება და დაამატე ფავორიტებში!',
    en: 'You have no listings yet. Start exploring and add favorites!',
    ru: 'Пока нет сохранённых объектов. Изучите каталог и добавьте избранное!',
  },
  filter: { ka: 'ეს თვე', en: 'This month', ru: 'Этот месяц' },
  badge: { ka: 'განაცხადი', en: 'listing', ru: 'объект' },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export function MyListingsSection({ listings }: MyListingsSectionProps) {
  const { language, t } = useLanguage();
  const safeLanguage = language === 'ru' ? 'ru' : language === 'en' ? 'en' : 'ka';
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(
        language === 'en' ? 'en-US' : language === 'ru' ? 'ru-RU' : 'ka-GE',
        { style: 'currency', currency: 'GEL', minimumFractionDigits: 0 }
      ),
    [language]
  );

  return (
    <section id="my-listings" className="space-y-5 rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_14px_50px_rgba(15,23,42,0.07)] dark:border-slate-800/60 dark:bg-slate-900/75 sm:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{copy.title[safeLanguage]}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{copy.subtitle[safeLanguage]}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
            {listings.length} {copy.badge[safeLanguage]}
          </span>
          <button
            type="button"
            aria-label={safeLanguage === 'ru' ? 'Фильтр объектов' : safeLanguage === 'en' ? 'Filter listings' : 'ფილტრი'}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300"
          >
            <DotsThreeOutline size={16} weight="bold" />
            {copy.filter[safeLanguage]}
            <CaretDown size={12} weight="bold" />
          </button>
        </div>
      </header>

      {listings.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-500">
          {copy.empty[safeLanguage]}
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.08 }}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {listings.map((property) => (
            <motion.article
              key={property.id}
              variants={cardVariants}
              whileHover={{ y: -6 }}
              className="group overflow-hidden rounded-[26px] border border-slate-100 bg-white shadow-[0_12px_45px_rgba(15,23,42,0.07)] transition will-change-transform hover:shadow-[0_20px_65px_rgba(15,23,42,0.1)] dark:border-slate-800/60 dark:bg-slate-900/80"
            >
              <div className="relative h-40 overflow-hidden">
                <Image
                  src={property.thumbnailUrl}
                  alt={property.title}
                  fill
                  sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {property.isNew && (
                  <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white shadow-lg">
                    {t('new') ?? 'New'}
                  </span>
                )}
              </div>
              <div className="space-y-4 px-5 py-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white line-clamp-2">
                    {property.title}
                  </h3>
                  <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
                    {t(property.status) ?? property.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  <MapPin size={16} weight="bold" className="mr-1 inline-block text-slate-400" />
                  {property.addressLine ?? property.city}
                </p>
                <div className="flex items-end justify-between gap-3">
                  <p className="text-xl font-semibold text-slate-900 dark:text-white">
                    {formatter.format(property.price)}
                  </p>
                  <div className="flex gap-4 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                    <span>{property.bedrooms ?? 0} BD</span>
                    <span>{property.bathrooms ?? 0} BA</span>
                    {property.area && <span>{property.area} მ²</span>}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}
    </section>
  );
}


