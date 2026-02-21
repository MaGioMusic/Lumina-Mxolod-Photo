'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Users, 
  Building2, 
  Mail, 
  TrendingUp,
  Eye
} from 'lucide-react';

// Mock data - replace with actual API calls
const stats = [
  { label: 'totalUsers', value: '1,234', change: '+12%', icon: Users },
  { label: 'totalProperties', value: '567', change: '+8%', icon: Building2 },
  { label: 'totalInquiries', value: '89', change: '+23%', icon: Mail },
  { label: 'totalViews', value: '45.2K', change: '+15%', icon: Eye },
];

const recentActivities = [
  { actionKey: 'newPropertyListed', fallback: 'New property listed', user: 'John Doe', timeKey: 'twoMinutesAgo', timeFallback: '2 minutes ago' },
  { actionKey: 'userRegistered', fallback: 'User registered', user: 'Jane Smith', timeKey: 'fiveMinutesAgo', timeFallback: '5 minutes ago' },
  { actionKey: 'inquiryReceived', fallback: 'Inquiry received', user: 'Mike Johnson', timeKey: 'tenMinutesAgo', timeFallback: '10 minutes ago' },
  { actionKey: 'propertyUpdated', fallback: 'Property updated', user: 'Sarah Williams', timeKey: 'fifteenMinutesAgo', timeFallback: '15 minutes ago' },
];

export default function AdminDashboardPage() {
  const { t } = useLanguage();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('dashboard') || 'Dashboard'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('adminDashboardOverview') || 'Overview of your real estate platform'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t(stat.label) || stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {stat.change}
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">{t('vsLastMonth') || 'vs last month'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('recentActivity') || 'Recent Activity'}
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0"
                >
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-medium">
                      {t(activity.actionKey) || activity.fallback}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('by') || 'by'} {activity.user} • {t(activity.timeKey) || activity.timeFallback}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('quickActions') || 'Quick Actions'}
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/admin/users"
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center"
              >
                <Users className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                <span className="text-gray-900 dark:text-white font-medium">{t('manageUsers') || 'Manage Users'}</span>
              </a>
              <a
                href="/admin/properties"
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center"
              >
                <Building2 className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                <span className="text-gray-900 dark:text-white font-medium">{t('manageProperties') || 'Manage Properties'}</span>
              </a>
              <a
                href="/dashboard/leads"
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center"
              >
                <Mail className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                <span className="text-gray-900 dark:text-white font-medium">{t('viewLeads') || 'View Leads'}</span>
              </a>
              <a
                href="/admin/settings"
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center"
              >
                <TrendingUp className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                <span className="text-gray-900 dark:text-white font-medium">{t('analytics') || 'Analytics'}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
