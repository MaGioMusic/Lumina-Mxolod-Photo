'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { IconProps } from '@phosphor-icons/react';
import { usePathname } from 'next/navigation';
import {
  SquaresFour,
  ChartLineUp,
  SquaresFour as GridIcon,
  UsersThree,
  EnvelopeSimple,
  Notebook,
} from '@phosphor-icons/react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ProfileUser } from '@/types/profile';
import { cn } from '@/lib/utils';

const copy = {
  menu: { ka: 'მენიუ', en: 'Menu', ru: 'Меню' },
  sections: { ka: 'სექციები', en: 'Sections', ru: 'Разделы' },
  insights: { ka: 'ინსაითები', en: 'Insights', ru: 'Инсайты' },
  support: { ka: 'კონტაქტი', en: 'Support', ru: 'Поддержка' },
  dashboard: { ka: 'დეშბორდი', en: 'Dashboard', ru: 'Дэшборд' },
  myStats: { ka: 'სტატისტიკა', en: 'Stats', ru: 'Статистика' },
  overview: { ka: 'მიმოხილვა', en: 'Overview', ru: 'Обзор' },
  listings: { ka: 'ჩემი განცხადებები', en: 'My listings', ru: 'Мои объекты' },
  performance: { ka: 'ეფექტიანობა', en: 'Performance', ru: 'Эффективность' },
  savedSearches: { ka: 'შენახული ძიებები', en: 'Saved searches', ru: 'Сохранённые поиски' },
  documents: { ka: 'დოკუმენტები', en: 'Documents', ru: 'Документы' },
  activity: { ka: 'აქტივობა', en: 'Activity', ru: 'Активность' },
  quickActions: { ka: 'სწრაფი ქმედებები', en: 'Quick actions', ru: 'Быстрые действия' },
  agent: { ka: 'ჩემი აგენტი', en: 'Assigned agent', ru: 'Мой агент' },
  viewProfile: { ka: 'პროფილის რედაქტირება', en: 'Edit profile', ru: 'Редактировать' },
};

interface NavItem {
  key: keyof typeof copy;
  href: string;
  icon: React.ComponentType<IconProps>;
}

const sections: Array<{ heading: keyof typeof copy; items: NavItem[] }> = [
  {
    heading: 'menu',
    items: [
      { key: 'dashboard', href: '/profile', icon: SquaresFour },
      { key: 'myStats', href: '/profile/performance', icon: ChartLineUp },
      { key: 'overview', href: '/profile', icon: GridIcon },
    ],
  },
  {
    heading: 'sections',
    items: [
      { key: 'listings', href: '/profile/listings', icon: SquaresFour },
      { key: 'performance', href: '/profile/performance', icon: ChartLineUp },
      { key: 'savedSearches', href: '/profile/saved-searches', icon: EnvelopeSimple },
      { key: 'documents', href: '/profile/documents', icon: Notebook },
    ],
  },
  { heading: 'insights', items: [{ key: 'activity', href: '/profile/activity', icon: UsersThree }] },
];

// routing paths – used for active highlighting only

function localize(language: string, key: keyof typeof copy) {
  const safeLanguage = language === 'ru' ? 'ru' : language === 'en' ? 'en' : 'ka';
  return copy[key][safeLanguage] ?? copy[key].en;
}

export function ProfileNavigation({ user }: { user: ProfileUser }) {
  const { language } = useLanguage();
  const pathname = usePathname();

  return (
    <aside className="flex h-full min-w-[200px] flex-col justify-between rounded-[28px] border border-slate-100 bg-white px-4 py-6 shadow-[0_18px_70px_rgba(15,23,42,0.08)] dark:border-slate-800/50 dark:bg-slate-900/70">
      <div className="space-y-6">
        {sections.map((section) => (
          <nav key={section.heading} className="space-y-3">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
              {localize(language, section.heading)}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-slate-500 transition-all hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-1 dark:text-slate-400 dark:hover:text-white',
                      isActive && 'text-slate-900 dark:text-white'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 transition group-hover:border-amber-200 group-hover:bg-amber-50 group-hover:text-amber-500 dark:border-slate-700 dark:bg-slate-800/60',
                        isActive && 'border-amber-200 bg-amber-50 text-amber-500 dark:border-amber-500/30 dark:bg-amber-500/20'
                      )}
                    >
                      <IconComponent size={18} weight="bold" />
                    </span>
                    <span>{localize(language, item.key)}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_14px_50px_rgba(15,23,42,0.08)] dark:border-slate-800/60 dark:bg-slate-900/75">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-700">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt={user.fullName} fill className="object-cover" sizes="44px" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-amber-100 text-sm font-semibold text-amber-700">
                {user.firstName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{user.fullName}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{localize(language, 'agent')}</p>
          </div>
        </div>
        <Link
          href="/profile"
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#F08336] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#e0743a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F08336]/60 focus-visible:ring-offset-2"
        >
          {localize(language, 'viewProfile')}
        </Link>
      </div>
    </aside>
  );
}

