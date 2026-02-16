'use client';

import Image from 'next/image';
import {
  User,
  Phone,
  EnvelopeSimple,
  PencilSimple,
  SealCheck
} from '@phosphor-icons/react';
import type { ProfileUser } from '@/types/profile';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProfileSideCardProps {
  user: ProfileUser;
  onEditProfile?: () => void;
}

const roleLabels: Record<ProfileUser['role'], { ka: string; en: string; ru: string }> = {
  client: { ka: 'კლიენტი', en: 'Client', ru: 'Клиент' },
  agent: { ka: 'აგენტა', en: 'Agent', ru: 'Агент' },
  investor: { ka: 'ინვესტორი', en: 'Investor', ru: 'Инвестор' },
  admin: { ka: 'ადმინისტრატორი', en: 'Admin', ru: 'Админ' },
};

export function ProfileSideCard({ user, onEditProfile }: ProfileSideCardProps) {
  const { language } = useLanguage();
  const safeLanguage = language === 'ru' ? 'ru' : language === 'en' ? 'en' : 'ka';
  
  const roleLabel = roleLabels[user.role]?.[safeLanguage] ?? user.role;

  return (
    <div className="flex flex-col items-center text-center">
      {/* Avatar */}
      <div className="relative mb-4">
        <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-slate-50 bg-slate-100 shadow-sm dark:border-slate-800 dark:bg-slate-800">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.fullName}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl text-slate-400">
              <User weight="fill" />
            </div>
          )}
        </div>
        {user.isVerified && (
           <div className="absolute bottom-0 right-0 rounded-full bg-blue-500 p-1 text-white shadow-sm border-2 border-white dark:border-slate-900">
             <SealCheck size={14} weight="fill" />
           </div>
        )}
      </div>

      {/* Name & Info */}
      <div className="mb-6 space-y-1">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.fullName}</h2>
        <div className="flex items-center justify-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            {roleLabel}
          </span>
          {user.companyTitle && (
            <span className="text-xs text-slate-500 dark:text-slate-500">
              {user.companyTitle}
            </span>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="mb-6 w-full space-y-3">
        {user.phone && (
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
            <Phone size={16} weight="duotone" className="shrink-0 text-slate-400" />
            <span className="truncate">{user.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
          <EnvelopeSimple size={16} weight="duotone" className="shrink-0 text-slate-400" />
          <span className="truncate">{user.email}</span>
        </div>
      </div>

      {/* Actions */}
      <button
        onClick={onEditProfile}
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
      >
        <PencilSimple size={16} weight="bold" />
        <span>Edit Profile</span>
      </button>
    </div>
  );
}




