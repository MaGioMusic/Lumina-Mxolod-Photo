'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { ChatsCircle, Headset, PlusCircle } from '@phosphor-icons/react';
import type { IconProps } from '@phosphor-icons/react';
import Link from 'next/link';
import type { ComponentType } from 'react';
import { cn } from '@/lib/utils';

const copy = {
  title: { ka: 'სწრაფი მოქმედებები', en: 'Quick actions', ru: 'Быстрые действия' },
  subtitle: {
    ka: 'იმოქმედე სწრაფად ბოლო 30 დღის აქტივობებზე',
    en: 'Take action on your last 30 days activity',
    ru: 'Действуйте по активности за последние 30 дней',
  },
  explore: { ka: 'ნახე ყველა ქონება', en: 'Explore listings', ru: 'Открыть каталог' },
  messages: { ka: 'შეტყობინებების ნახვა', en: 'View messages', ru: 'Сообщения' },
  support: { ka: 'კონტაქტი მხარდაჭერასთან', en: 'Contact support', ru: 'Поддержка' },
};

const actions = [
  {
    id: 'explore',
    href: '#my-listings',
    icon: PlusCircle,
    variant: 'primary' as const,
    copyKey: 'explore' as const,
  },
  {
    id: 'messages',
    href: '#client-activity',
    icon: ChatsCircle,
    variant: 'secondary' as const,
    copyKey: 'messages' as const,
  },
  {
    id: 'support',
    href: 'mailto:support@luminaestate.ge',
    icon: Headset,
    variant: 'secondary' as const,
    copyKey: 'support' as const,
  },
];

export function QuickActionsCard() {
  const { language } = useLanguage();
  const safeLanguage = language === 'ru' ? 'ru' : language === 'en' ? 'en' : 'ka';

  return (
    <section
      id="quick-actions"
      className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_12px_45px_rgba(15,23,42,0.07)] dark:border-slate-800/60 dark:bg-slate-900/75 sm:p-7"
    >
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{copy.title[safeLanguage]}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{copy.subtitle[safeLanguage]}</p>
      </header>
      <div className="mt-5 grid gap-3">
        {actions.map((action) => (
          <ActionButton
            key={action.id}
            href={action.href}
            Icon={action.icon}
            label={copy[action.copyKey][safeLanguage]}
            variant={action.variant}
          />
        ))}
      </div>
    </section>
  );
}

function ActionButton({
  href,
  Icon,
  label,
  variant,
}: {
  href: string;
  Icon: ComponentType<IconProps>;
  label: string;
  variant: 'primary' | 'secondary';
}) {
  const base =
    'group inline-flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F08336]/60 focus-visible:ring-offset-2';
  const styling =
    variant === 'primary'
      ? 'bg-[#F08336] text-white shadow-[0_16px_45px_rgba(240,131,54,0.25)] hover:bg-[#e0743a]'
      : 'border border-slate-200 bg-white text-slate-600 hover:border-[#F08336]/40 hover:text-[#F08336] dark:border-slate-700 dark:bg-slate-800/75 dark:text-slate-200';

  const content = (
    <>
      <span className="inline-flex items-center gap-2">
        <Icon size={18} weight="bold" />
        {label}
      </span>
      <span className="text-xs uppercase tracking-[0.22em] text-white/70 group-hover:text-white/90 dark:text-slate-400">
        →
      </span>
    </>
  );

  if (href.startsWith('mailto:')) {
    return (
      <a href={href} className={cn(base, styling)}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={cn(base, styling)}>
      {content}
    </Link>
  );
}


