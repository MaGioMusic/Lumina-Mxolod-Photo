'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Heart } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import PropertyCard from '../properties/components/PropertyCard';
import { useFavorites, FavoriteProperty } from '@/contexts/FavoritesContext';
import { useLanguage } from '@/contexts/LanguageContext';

const copy = {
  subtitle: {
    ka: 'შენახული ქონებები ერთ სივრცეში — სწრაფად იპოვე და გადაამოწმე.',
    en: 'Saved listings in one calm space, ready when you are.',
    ru: 'Сохранённые объекты в одном спокойном месте.',
  },
  summary: {
    savedLabel: {
      ka: 'შენახულია',
      en: 'Saved',
      ru: 'Сохранено',
    },
    savedHelper: {
      ka: 'სულ რჩეული ქონება',
      en: 'Total saved listings',
      ru: 'Всего избранных объектов',
    },
    typesLabel: {
      ka: 'ტიპები',
      en: 'Types',
      ru: 'Типы',
    },
    typesHelper: {
      ka: 'უნიკალური კატეგორია',
      en: 'Unique property types',
      ru: 'Уникальные типы',
    },
    areaLabel: {
      ka: 'საშ. ფართი',
      en: 'Avg area',
      ru: 'Средняя площадь',
    },
    areaHelper: {
      ka: 'მ² — ხელმისაწვდომი მონაცემებით',
      en: 'm² based on available data',
      ru: 'м² по доступным данным',
    },
    notAvailable: {
      ka: '—',
      en: '—',
      ru: '—',
    },
  },
  emptyTitle: {
    ka: 'ფავორიტები ცარიელია',
    en: 'No favorites yet',
    ru: 'Избранного пока нет',
  },
  emptyDescription: {
    ka: 'დააჭირე ❤️ ღილაკს ნებისმიერ განცხადებაზე და ის აქ გამოჩნდება.',
    en: 'Tap the heart on any listing and it will appear here.',
    ru: 'Нажмите на сердечко в объявлении — и оно появится здесь.',
  },
  browseCta: {
    ka: 'ქონებების დათვალიერება',
    en: 'Browse properties',
    ru: 'Смотреть объекты',
  },
  clearAll: {
    ka: 'ყველას წაშლა',
    en: 'Clear all',
    ru: 'Очистить все',
  },
  clearConfirm: {
    ka: 'ნამდვილად გსურთ ყველა რჩეულის წაშლა?',
    en: 'Remove all saved properties?',
    ru: 'Удалить все избранные объекты?',
  },
  sortLabel: {
    ka: 'დახარისხება',
    en: 'Sort by',
    ru: 'Сортировка',
  },
  sortNewest: {
    ka: 'ახალი დამატება',
    en: 'Newest',
    ru: 'Сначала новые',
  },
  sortPriceAsc: {
    ka: 'ფასი: დაბლიდან',
    en: 'Price: Low → High',
    ru: 'Цена: по возрастанию',
  },
  sortPriceDesc: {
    ka: 'ფასი: მაღლიდან',
    en: 'Price: High → Low',
    ru: 'Цена: по убыванию',
  },
  sortAreaAsc: {
    ka: 'ფართი: მცირე',
    en: 'Area: Small → Large',
    ru: 'Площадь: меньше → больше',
  },
  sortAreaDesc: {
    ka: 'ფართი: დიდი',
    en: 'Area: Large → Small',
    ru: 'Площадь: больше → меньше',
  },
  removedToast: {
    ka: 'ქონება წაიშალა ფავორიტებიდან.',
    en: 'Listing removed from favorites.',
    ru: 'Объект удалён из избранного.',
  },
  undoAction: {
    ka: 'დაბრუნება',
    en: 'Undo',
    ru: 'Отменить',
  },
};

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'area-asc' | 'area-desc';

const parsePriceValue = (price: string) => {
  const numeric = Number(String(price).replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  return numeric;
};

const parseAreaValue = (area?: string) => {
  if (!area) return undefined;
  const numeric = Number(String(area).replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(numeric) || numeric <= 0) return undefined;
  return numeric;
};

export default function FavoritesClient() {
  const { t, language } = useLanguage();
  const { state, clearFavorites, addToFavorites, removeFromFavorites } = useFavorites();
  const { favorites, isLoading } = state;
  const safeLanguage = language === 'ru' ? 'ru' : language === 'en' ? 'en' : 'ka';
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [undoPayload, setUndoPayload] = useState<FavoriteProperty | null>(null);
  const undoTimerRef = useRef<number | null>(null);
  const numberFormatter = useMemo(() => new Intl.NumberFormat(language), [language]);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        window.clearTimeout(undoTimerRef.current);
      }
    };
  }, []);

  const showUndo = useCallback((property: FavoriteProperty) => {
    if (undoTimerRef.current) {
      window.clearTimeout(undoTimerRef.current);
    }
    setUndoPayload(property);
    undoTimerRef.current = window.setTimeout(() => {
      setUndoPayload(null);
      undoTimerRef.current = null;
    }, 5000);
  }, []);

  const handleUndo = useCallback(() => {
    if (!undoPayload) return;
    addToFavorites(undoPayload);
    setUndoPayload(null);
    if (undoTimerRef.current) {
      window.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  }, [addToFavorites, undoPayload]);

  const handleFavoriteToggle = useCallback(
    (property: FavoriteProperty, nextIsFavorite: boolean) => {
      if (nextIsFavorite) {
        addToFavorites(property);
        return;
      }
      removeFromFavorites(property.id);
      showUndo(property);
    },
    [addToFavorites, removeFromFavorites, showUndo]
  );

  const sortedFavorites = useMemo(() => {
    const list = [...favorites];
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => parsePriceValue(a.price) - parsePriceValue(b.price));
      case 'price-desc':
        return list.sort((a, b) => parsePriceValue(b.price) - parsePriceValue(a.price));
      case 'area-asc':
        return list.sort((a, b) => (parseAreaValue(a.area) ?? 0) - (parseAreaValue(b.area) ?? 0));
      case 'area-desc':
        return list.sort((a, b) => (parseAreaValue(b.area) ?? 0) - (parseAreaValue(a.area) ?? 0));
      default:
        return list;
    }
  }, [favorites, sortBy]);

  const favoritesCount = favorites.length;
  const summaryStats = useMemo(() => {
    const typeSet = new Set(favorites.map((item) => item.type).filter(Boolean));
    const areaValues = favorites
      .map((item) => parseAreaValue(item.area))
      .filter((value): value is number => typeof value === 'number');
    const avgArea = areaValues.length
      ? Math.round(areaValues.reduce((sum, value) => sum + value, 0) / areaValues.length)
      : null;
    return {
      saved: numberFormatter.format(favoritesCount),
      types: typeSet.size ? numberFormatter.format(typeSet.size) : copy.summary.notAvailable[safeLanguage],
      avgArea: avgArea ? `${numberFormatter.format(avgArea)} м²` : copy.summary.notAvailable[safeLanguage],
      hasArea: areaValues.length > 0,
    };
  }, [favorites, favoritesCount, numberFormatter, safeLanguage]);

  const summaryCards = useMemo(
    () => [
      {
        key: 'saved',
        label: copy.summary.savedLabel[safeLanguage],
        value: summaryStats.saved,
        helper: copy.summary.savedHelper[safeLanguage],
        accent: 'text-[#F08336]',
        glow: 'bg-orange-500/10',
      },
      {
        key: 'types',
        label: copy.summary.typesLabel[safeLanguage],
        value: summaryStats.types,
        helper: copy.summary.typesHelper[safeLanguage],
        accent: 'text-emerald-600 dark:text-emerald-300',
        glow: 'bg-emerald-500/10',
      },
      {
        key: 'area',
        label: copy.summary.areaLabel[safeLanguage],
        value: summaryStats.avgArea,
        helper: summaryStats.hasArea
          ? copy.summary.areaHelper[safeLanguage]
          : copy.summary.notAvailable[safeLanguage],
        accent: 'text-sky-600 dark:text-sky-300',
        glow: 'bg-sky-500/10',
      },
    ],
    [safeLanguage, summaryStats]
  );

  const handleClearAll = () => {
    if (favorites.length === 0) return;
    if (window.confirm(copy.clearConfirm[safeLanguage])) {
      clearFavorites();
      setUndoPayload(null);
      if (undoTimerRef.current) {
        window.clearTimeout(undoTimerRef.current);
        undoTimerRef.current = null;
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#111111] pt-20">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white/80 py-16 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-gray-200 border-t-[#F08336] dark:border-gray-700" />
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{t('loading') || 'Loading...'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111111] pt-20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-[#F08336] shadow-sm dark:border-orange-500/20 dark:bg-orange-500/10">
              <Heart size={24} weight="fill" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
                  {t('favorites')}
                </h1>
                {favoritesCount > 0 && (
                  <span className="rounded-full border border-gray-200 bg-white/80 px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-200">
                    {favoritesCount} {t('propertiesCount') || 'properties'}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {copy.subtitle[safeLanguage]}
              </p>
            </div>
          </div>
        </motion.header>

        {favoritesCount > 0 && (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {summaryCards.map((card, index) => (
                <SummaryCard
                  key={card.key}
                  label={card.label}
                  value={card.value}
                  helper={card.helper}
                  accent={card.accent}
                  glow={card.glow}
                  delay={index * 0.05}
                />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-sm text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900/70 dark:text-gray-300">
              <span>
                {t('showing') || 'Showing'} {sortedFavorites.length} {t('propertiesCount') || 'properties'}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="favorites-sort" className="sr-only sm:not-sr-only sm:text-xs sm:text-gray-500 dark:sm:text-gray-400">
                  {copy.sortLabel[safeLanguage]}
                </label>
                <select
                  id="favorites-sort"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortOption)}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-[#F08336]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F08336]/50 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900/70 dark:text-gray-200"
                >
                  <option value="newest">{copy.sortNewest[safeLanguage]}</option>
                  <option value="price-asc">{copy.sortPriceAsc[safeLanguage]}</option>
                  <option value="price-desc">{copy.sortPriceDesc[safeLanguage]}</option>
                  <option value="area-asc">{copy.sortAreaAsc[safeLanguage]}</option>
                  <option value="area-desc">{copy.sortAreaDesc[safeLanguage]}</option>
                </select>
                <Link
                  href="/properties"
                  className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-[#F08336]/50 hover:text-[#F08336] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F08336]/50 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900/70 dark:text-gray-200"
                >
                  {copy.browseCta[safeLanguage]}
                </Link>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center justify-center rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 dark:border-red-500/30 dark:bg-gray-900/70 dark:text-red-300 dark:hover:bg-red-500/10"
                >
                  {copy.clearAll[safeLanguage]}
                </button>
              </div>
            </div>
          </>
        )}

        {favoritesCount === 0 ? (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.05 }}
            className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white/80 px-6 py-16 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900/70"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#F08336] dark:bg-orange-500/10">
              <Heart size={26} weight="fill" />
            </span>
            <h2 className="mt-5 text-2xl font-semibold text-gray-900 dark:text-white">
              {copy.emptyTitle[safeLanguage]}
            </h2>
            <p className="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">
              {copy.emptyDescription[safeLanguage]}
            </p>
            <Link
              href="/properties"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-[#F08336] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(240,131,54,0.25)] transition hover:bg-[#e0743a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F08336]/60 focus-visible:ring-offset-2"
            >
              {copy.browseCta[safeLanguage]}
            </Link>
          </motion.section>
        ) : (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {sortedFavorites.map((property) => {
                const areaValue = parseAreaValue(property.area);
                return (
                  <motion.div
                    key={property.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    <PropertyCard
                      id={property.id}
                      image={property.image}
                      images={[property.image]}
                      price={property.price}
                      address={property.location}
                      title={property.title}
                      bedrooms={property.bedrooms ?? 0}
                      bathrooms={property.bathrooms ?? 0}
                      sqft={areaValue}
                      area={property.area}
                      type={property.type}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.section>
        )}
        <AnimatePresence>
          {undoPayload && (
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              role="status"
              aria-live="polite"
              className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-gray-900 px-4 py-2 text-sm text-white shadow-lg"
            >
              <span>{copy.removedToast[safeLanguage]}</span>
              <button
                type="button"
                onClick={handleUndo}
                className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
              >
                {copy.undoAction[safeLanguage]}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  helper: string;
  accent: string;
  glow: string;
  delay?: number;
}

function SummaryCard({ label, value, helper, accent, glow, delay = 0 }: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay }}
      className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 shadow-sm dark:border-gray-800 dark:bg-gray-900/70"
    >
      <div className={`absolute -right-6 -top-6 h-16 w-16 rounded-full blur-2xl ${glow}`} />
      <div className="relative space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
          {label}
        </p>
        <p className={`text-2xl font-semibold ${accent}`}>{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{helper}</p>
      </div>
    </motion.div>
  );
}
