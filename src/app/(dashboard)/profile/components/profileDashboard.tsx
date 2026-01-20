'use client';

import { useMemo } from 'react';
import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { DataTable } from '@/components/data-table';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ProfileDocument, UserProfile } from '@/types/profile';
import { ProfileHeader, type ProfileHeaderMetric } from './profileHeader';
import { ProfileTabs } from './profileTabs';
import { NotificationsPanel } from './notificationsPanel';
import { QuickActionsCard } from './quickActionsCard';
import AssignedAgentCard from './assignedAgentCard';
import { RemindersCard } from './remindersCard';

interface ProfileDashboardProps {
  profile: UserProfile;
}

const statusLabelMap: Record<ProfileDocument['status'], string> = {
  completed: 'Done',
  pending: 'In Progress',
  expired: 'Not Started',
};

export default function ProfileDashboard({ profile }: ProfileDashboardProps) {
  const { language } = useLanguage();

  const headerMetrics = useMemo<ProfileHeaderMetric[]>(
    () => [
      { id: 'metric-active', labelKey: 'activeListings', value: profile.appointments.length },
      { id: 'metric-saved', labelKey: 'savedProperties', value: profile.favorites.length },
      { id: 'metric-inquiries', labelKey: 'openInquiries', value: profile.inquiries.length },
    ],
    [profile.appointments.length, profile.favorites.length, profile.inquiries.length]
  );

  const tableData = useMemo(
    () =>
      profile.documents.map((document, index) => ({
        id: index + 1,
        header: document.name,
        type: document.category,
        status: statusLabelMap[document.status],
        target: new Date(document.updatedAt).toLocaleDateString(language),
        limit: document.downloadUrl ? 'Available' : '—',
        reviewer: document.status === 'completed' ? 'Lumina' : 'Assign reviewer',
      })),
    [language, profile.documents]
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <ProfileHeader
              user={profile.user}
              metrics={headerMetrics}
              unreadNotifications={profile.notifications.filter((item) => !item.isRead).length}
              savedSearchesCount={profile.savedSearches.length}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 px-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 lg:px-6">
            {profile.stats.slice(0, 4).map((stat) => {
              const isDown = stat.change?.type === 'down';
              const ChangeIcon = isDown ? TrendingDownIcon : TrendingUpIcon;
              const changeLabel = stat.change?.percentage
                ? `${stat.change.percentage}%`
                : stat.change?.label ?? '';

              return (
                <Card key={stat.id} className="@container/card">
                  <CardHeader className="relative">
                    <CardDescription>{stat.label}</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                      {stat.value}
                    </CardTitle>
                    {changeLabel ? (
                      <div className="absolute right-4 top-4">
                        <Badge
                          variant="outline"
                          className="flex gap-1 rounded-lg text-xs text-slate-600 dark:text-slate-200"
                        >
                          <ChangeIcon className="size-3" />
                          {changeLabel}
                        </Badge>
                      </div>
                    ) : null}
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      {stat.change?.label ?? stat.description ?? ''}
                      {changeLabel ? <ChangeIcon className="size-4" /> : null}
                    </div>
                    {stat.description ? (
                      <div className="text-muted-foreground">{stat.description}</div>
                    ) : null}
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-6 px-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-6">
            <div className="flex flex-col gap-6">
              <ChartAreaInteractive chartHeight={320} />
              <DataTable data={tableData} />
            </div>

            <div className="grid gap-6">
              <NotificationsPanel notifications={profile.notifications} />
              <QuickActionsCard />
              <AssignedAgentCard agent={profile.user.assignedAgent} />
              <RemindersCard appointments={profile.appointments} notifications={profile.notifications} />
            </div>
          </div>

          <div className="px-4 lg:px-6">
            <ProfileTabs
              favorites={profile.favorites}
              savedSearches={profile.savedSearches}
              appointments={profile.appointments}
              inquiries={profile.inquiries}
              documents={profile.documents}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
