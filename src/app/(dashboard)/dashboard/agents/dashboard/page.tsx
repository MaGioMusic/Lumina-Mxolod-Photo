'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { Users, ChartLine, TrendUp, UserCheck } from '@phosphor-icons/react';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  // Redirect if not authenticated or not an agent
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'agent') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'agent') {
    return null;
  }

  const dashboardCards = [
    {
      title: t('clients'),
      description: 'Manage your client relationships and track interactions',
      icon: Users,
      href: '/agents?tab=clients',
      color: 'bg-blue-500',
      stats: '24 Active Clients'
    },
    {
      title: t('analytics'),
      description: 'View performance metrics and sales analytics',
      icon: ChartLine,
      href: '/agents?tab=analytics',
      color: 'bg-green-500',
      stats: '₾450K This Month'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('dashboard')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
                          Welcome back, {user?.name}! Here's your agent dashboard overview.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Clients</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">24</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendUp className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Sales</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">₾450K</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCheck className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Deals</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">8</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartLine className="h-8 w-8 text-primary-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Success Rate</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">87%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {dashboardCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.href}
                onClick={() => router.push(card.href)}
                className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-[#F08336] hover:scale-105"
              >
                <div className="flex items-start space-x-4">
                  <div className={`${card.color} p-3 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-[#F08336] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {card.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {card.stats}
                      </span>
                      <span className="text-[#F08336] font-medium text-sm group-hover:underline">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Recent Activity
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  New client inquiry from John Smith - 2 hours ago
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Property viewing scheduled for tomorrow at 3 PM
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Contract signed for Vake apartment - ₾180K
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 