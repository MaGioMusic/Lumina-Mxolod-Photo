'use client';

import type { ProfileNotification } from '@/types/profile';
import { Bell, Check } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export function NotificationsPanel({ notifications }: { notifications: ProfileNotification[] }) {
  const displayNotifications = notifications.slice(0, 4); // Show only top 4

  return (
    <section className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
            <Bell size={16} weight="fill" />
          </div>
          <h2 className="font-bold text-slate-900 dark:text-white">Updates</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          {notifications.filter(n => !n.isRead).length} New
        </span>
      </header>

      <div className="flex flex-col gap-4">
        {displayNotifications.map((notification) => (
          <div key={notification.id} className="group flex gap-3">
            <div className="relative mt-1 flex-shrink-0">
              <div className={cn(
                "h-2 w-2 rounded-full",
                notification.isRead ? "bg-slate-200 dark:bg-slate-700" : "bg-amber-500"
              )} />
            </div>
            <div className="space-y-1">
              <p className={cn(
                "text-sm leading-snug transition-colors",
                notification.isRead 
                  ? "text-slate-500 dark:text-slate-400" 
                  : "font-medium text-slate-900 dark:text-white"
              )}>
                {notification.message}
              </p>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                {new Date(notification.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
        
        {notifications.length === 0 && (
           <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
             <Check size={32} className="mb-2 opacity-20" />
             <p className="text-sm">All caught up!</p>
           </div>
        )}
      </div>
      
      <button className="mt-auto pt-4 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors w-full text-center border-t border-slate-100 dark:border-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2">
        View all activity
      </button>
    </section>
  );
}
