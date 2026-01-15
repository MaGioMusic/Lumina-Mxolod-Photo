'use client';

import { motion, type Variants } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Star,
  CalendarDots,
  ChatCircleDots,
  TrendUp,
  type Icon,
} from '@phosphor-icons/react';
import type { ProfileStat } from '@/types/profile';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, Icon> = {
  Star,
  Calendar: CalendarDots,
  Chat: ChatCircleDots,
  TrendUp,
};

interface ProfileStatsProps {
  stats: ProfileStat[];
  isLoading?: boolean;
}

// Animations
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } },
};

export function ProfileStats({ stats, isLoading }: ProfileStatsProps) {
  if (isLoading) {
    return <div className="h-32 w-full animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
    >
      {stats.map((stat) => {
        const trend = stat.change?.type;
        const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;
        const IconComponent = stat.icon ? ICON_MAP[stat.icon] : undefined;
        
        const isUp = trend === 'up';
        const isDown = trend === 'down';

        return (
          <motion.div
            key={stat.id}
            variants={cardVariants}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
          >
             {/* Background Decoration */}
             <div className={cn(
                "absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-5 transition-transform group-hover:scale-150",
                stat.accent === 'emerald' ? 'bg-emerald-500' :
                stat.accent === 'amber' ? 'bg-amber-500' :
                stat.accent === 'sky' ? 'bg-sky-500' : 'bg-slate-500'
             )} />

            <div className="mb-4 flex items-start justify-between">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                "bg-slate-50 dark:bg-slate-800"
              )}>
                {IconComponent && <IconComponent size={20} weight="duotone" className="text-slate-700 dark:text-slate-300" />}
              </div>
              
              {stat.change && (
                <div className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                    isUp ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                    isDown ? "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" : 
                    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                )}>
                  <TrendIcon size={12} weight="bold" />
                  <span>{stat.change.percentage ? `${stat.change.percentage}%` : ''}</span>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {stat.value}
              </h3>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
