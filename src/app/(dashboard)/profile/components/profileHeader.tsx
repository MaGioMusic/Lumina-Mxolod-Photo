'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Phone,
  EnvelopeSimple,
  ShieldCheck,
  CrownSimple,
  BellSimple,
  BookmarkSimple,
  ChatsCircle,
  PlusCircle,
  Headset,
} from '@phosphor-icons/react';
import type { ComponentType } from 'react';
import type { IconProps } from '@phosphor-icons/react';
import type { ProfileUser } from '@/types/profile';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

type ProfileHeaderMetricKey = 'activeListings' | 'savedProperties' | 'openInquiries';

export interface ProfileHeaderMetric {
  id: string;
  labelKey: ProfileHeaderMetricKey;
  value: number;
}

interface ProfileHeaderProps {
  user: ProfileUser;
  metrics?: ProfileHeaderMetric[];
  unreadNotifications?: number;
  savedSearchesCount?: number;
  onEditProfile?: () => void;
}

const roleLabels: Record<ProfileUser['role'], { ka: string; en: string; ru: string }> = {
  client: { ka: 'კლიენტი', en: 'Client', ru: 'Клиент' },
  agent: { ka: 'აგენტა', en: 'Agent', ru: 'Агент' },
  investor: { ka: 'ინვესტორი', en: 'Investor', ru: 'Инвестор' },
  admin: { ka: 'ადმინისტრატორი', en: 'Admin', ru: 'Админ' },
};

const copy = {
  welcome: { ka: 'მოგესალმები', en: 'Welcome', ru: 'Добро пожаловать' },
  membership: { ka: 'პრემიუმ წევრი', en: 'Premium member', ru: 'Премиум участник' },
  notifications: { ka: 'ახალი შეტყობინებები', en: 'New alerts', ru: 'Новые оповещения' },
  savedSearches: { ka: 'შენახული ძიებები', en: 'Saved searches', ru: 'Сохранённые поиски' },
  joined: { ka: 'შემოუერთდა', en: 'Joined', ru: 'Присоединился' },
  lastActive: { ka: 'ბოლო აქტივობა', en: 'Last active', ru: 'Был в сети' },
  quickActions: {
    addListing: { ka: 'ყველა განცხადება', en: 'Explore listings', ru: 'Каталог объектов' },
    viewMessages: { ka: 'შეტყობინებები', en: 'View messages', ru: 'Открыть сообщения' },
    contactSupport: { ka: 'დამატებითი დახმარება', en: 'Contact support', ru: 'Связаться с поддержкой' },
  },
  editProfile: { ka: 'პროფილის რედაქტირება', en: 'Edit profile', ru: 'Редактировать профиль' },
  metrics: {
    activeListings: {
      label: { ka: 'აქტიური ტურის გეგმები', en: 'Active tours', ru: 'Активные туры' },
      helper: { ka: 'დაგეგმილი ვიზიტები', en: 'Scheduled viewings', ru: 'Запланированные показы' },
    },
    savedProperties: {
      label: { ka: 'შენახული ქონებები', en: 'Saved properties', ru: 'Избранные объекты' },
      helper: { ka: 'ფავორიტების სია', en: 'In your wishlist', ru: 'В избранном' },
    },
    openInquiries: {
      label: { ka: 'გაგზავნილი მოთხოვნები', en: 'Open inquiries', ru: 'Открытые запросы' },
      helper: { ka: 'აგენტთან პროცესში', en: 'Awaiting responses', ru: 'Ожидают ответа' },
    },
  },
};

const metricConfig: Record<
  ProfileHeaderMetricKey,
  {
    Icon: ComponentType<IconProps>;
    accent: string;
    glow: string;
  }
> = {
  activeListings: {
    Icon: CrownSimple,
    accent: 'text-sky-600 dark:text-sky-200',
    glow: 'bg-sky-500/12 dark:bg-sky-500/18',
  },
  savedProperties: {
    Icon: BookmarkSimple,
    accent: 'text-emerald-600 dark:text-emerald-200',
    glow: 'bg-emerald-500/12 dark:bg-emerald-500/18',
  },
  openInquiries: {
    Icon: ChatsCircle,
    accent: 'text-amber-600 dark:text-amber-200',
    glow: 'bg-amber-500/12 dark:bg-amber-500/18',
  },
};

const pillVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function ProfileHeader({
  user,
  metrics = [],
  unreadNotifications = 0,
  savedSearchesCount = 0,
  onEditProfile,
}: ProfileHeaderProps) {
  const { language, t } = useLanguage();
  const safeLanguage = language === 'ru' ? 'ru' : language === 'en' ? 'en' : 'ka';
  const localize = <T extends { ka: string; en: string; ru: string }>(node: T) =>
    node[safeLanguage] ?? node.en;

  const welcomeLine = `${copy.welcome[safeLanguage]}, ${user.firstName}!`;
  const membershipLabel = user.companyTitle ?? copy.membership[safeLanguage];
  const joinedText = `${copy.joined[safeLanguage]} · ${new Date(user.joinedAt).toLocaleDateString(language)}`;
  const lastActiveText =
    user.lastLoginAt !== undefined && user.lastLoginAt !== null
      ? `${copy.lastActive[safeLanguage]} · ${new Date(user.lastLoginAt).toLocaleString(language)}`
      : null;

  const formattedNotifications =
    unreadNotifications > 0 ? `${unreadNotifications} ${copy.notifications[safeLanguage]}` : null;
  const formattedSavedSearches =
    savedSearchesCount > 0 ? `${savedSearchesCount} ${copy.savedSearches[safeLanguage]}` : null;

  const numberFormatter = new Intl.NumberFormat(language);

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white/95 px-6 pb-8 pt-9 shadow-[0_18px_60px_rgba(15,23,42,0.08)] dark:border-slate-800/60 dark:bg-slate-900/70 sm:px-8"
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-6">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 160, damping: 18 }}
              className="relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-slate-800 md:h-28 md:w-28"
            >
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.fullName}
                  fill
                  sizes="128px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100 text-2xl font-semibold text-slate-600">
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </div>
              )}
            </motion.div>

            <div className="space-y-4">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-500 dark:bg-slate-800/80 dark:text-slate-300">
                  {membershipLabel}
                </span>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06, duration: 0.45, ease: 'easeOut' }}
                  className="text-3xl font-semibold text-slate-900 dark:text-white sm:text-[34px]"
                >
                  {welcomeLine}
                </motion.h1>
                <p className="max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {user.companyName ??
                    (safeLanguage === 'ru'
                      ? 'Аккаунт Lumina Estate Premium обеспечивает персональные консультации и индивидуальные рекомендации.'
                      : safeLanguage === 'en'
                      ? 'Your Lumina dashboard curates personal tours, saved homes, and agent conversations in one place.'
                      : 'Lumina პანელი ერთ სივრცეში გაჩვენებს შენახულ ქონებებს, დაგეგმილ ტურბებს და აგენტთან კომუნიკაციას.')}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <motion.span
                  variants={pillVariants}
                  initial="hidden"
                  animate="visible"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800/70 dark:text-slate-200"
                >
                  {roleLabels[user.role]?.[safeLanguage] ?? user.role}
                  {user.isVerified && <ShieldCheck size={16} weight="fill" />}
                </motion.span>
                {formattedNotifications && (
                  <motion.span
                    variants={pillVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.05 }}
                    className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-600 dark:bg-sky-500/20 dark:text-sky-200"
                  >
                    <BellSimple size={14} weight="bold" />
                    {formattedNotifications}
                  </motion.span>
                )}
                {formattedSavedSearches && (
                  <motion.span
                    variants={pillVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.08 }}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200"
                  >
                    <BookmarkSimple size={14} weight="bold" />
                    {formattedSavedSearches}
                  </motion.span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-700 dark:bg-slate-800/70">
                  {joinedText}
                </span>
                {lastActiveText && (
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-700 dark:bg-slate-800/70">
                    {lastActiveText}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:min-w-[320px]">
            {metrics.map((metric) => {
              const config = metricConfig[metric.labelKey];
              const Icon = config?.Icon ?? CrownSimple;
              const label = copy.metrics[metric.labelKey].label;
              const helper = copy.metrics[metric.labelKey].helper;
              return (
                <motion.article
                  key={metric.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_14px_45px_rgba(15,23,42,0.08)] dark:border-slate-800/60 dark:bg-slate-900/75"
                >
                  <div className={cn('absolute -right-6 -top-8 h-20 w-20 rounded-full blur-2xl', config.glow)} />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.26em] text-slate-400 dark:text-slate-500">
                        {localize(label)}
                      </p>
                      <p className={cn('mt-3 text-3xl font-semibold', config.accent)}>
                        {numberFormatter.format(metric.value)}
                      </p>
                    </div>
                    <span className={cn('flex h-11 w-11 items-center justify-center rounded-2xl border border-white/40 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/70', config.accent)}>
                      <Icon size={20} weight="bold" />
                    </span>
                  </div>
                  <p className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {localize(helper)}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <HeroQuickAction
            icon={PlusCircle}
            label={copy.quickActions.addListing[safeLanguage]}
            href="#my-listings"
            variant="primary"
          />
          <HeroQuickAction
            icon={ChatsCircle}
            label={copy.quickActions.viewMessages[safeLanguage]}
            href="#client-activity"
            variant="secondary"
          />
          <HeroQuickAction
            icon={Headset}
            label={copy.quickActions.contactSupport[safeLanguage]}
            href="mailto:support@luminaestate.ge"
            variant="secondary"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <ProfileHeaderButton
            icon={<Phone size={18} weight="bold" />}
            label={user.phone ?? t('callUs')}
            href={user.phone ? `tel:${user.phone.replace(/\s+/g, '')}` : undefined}
            variant="ghost"
          />
          <ProfileHeaderButton
            icon={<EnvelopeSimple size={18} weight="bold" />}
            label={user.email}
            href={`mailto:${user.email}`}
            variant="outline"
          />
          <ProfileHeaderButton
            label={copy.editProfile[safeLanguage]}
            onClick={onEditProfile}
            variant="primary"
          />
        </div>
      </div>
    </motion.section>
  );
}

interface ProfileHeaderButtonProps {
  icon?: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
}

function ProfileHeaderButton({ icon, label, href, onClick, variant = 'outline' }: ProfileHeaderButtonProps) {
  const baseClass =
    'inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F08336]/60 focus-visible:ring-offset-2';

  const variantClass =
    variant === 'primary'
      ? 'bg-[#F08336] text-white shadow-[0_16px_40px_rgba(240,131,54,0.35)] hover:bg-[#e0743a] active:scale-[0.99]'
      : variant === 'ghost'
      ? 'border border-transparent bg-slate-900/90 text-white hover:bg-slate-900 dark:bg-white/90 dark:text-slate-900'
      : 'border border-slate-200/80 bg-white/75 text-slate-700 hover:border-[#F08336]/50 hover:text-[#F08336] dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200';

  const content = (
    <>
      {icon}
      <span className="truncate">{label}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={cn(baseClass, variantClass)}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cn(baseClass, variantClass)}>
      {content}
    </button>
  );
}
interface HeroQuickActionProps {
  icon: ComponentType<IconProps>;
  label: string;
  href: string;
  variant: 'primary' | 'secondary';
}

function HeroQuickAction({ icon: Icon, label, href, variant }: HeroQuickActionProps) {
  const base =
    'group inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F08336]/50 focus-visible:ring-offset-2';
  const styles =
    variant === 'primary'
      ? 'bg-[#F08336] text-white shadow-[0_12px_35px_rgba(240,131,54,0.28)] hover:bg-[#e0743a] active:scale-[0.98]'
      : 'border border-slate-200 bg-white/90 text-slate-700 hover:border-[#F08336]/40 hover:text-[#F08336] dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200';

  return (
    <a href={href} className={cn(base, styles)}>
      <Icon size={18} weight="bold" />
      {label}
    </a>
  );
}


