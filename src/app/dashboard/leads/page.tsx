'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  Phone, 
  User, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowRight,
  Filter,
  Search,
  MoreVertical,
  Building
} from 'lucide-react';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  propertyId?: string;
  propertyTitle?: string;
  status: 'NEW' | 'CONTACTED' | 'VIEWING_SCHEDULED' | 'NEGOTIATING' | 'CLOSED_WON' | 'CLOSED_LOST';
  createdAt: string;
  assignedTo?: string;
}

const statusColors = {
  NEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  CONTACTED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  VIEWING_SCHEDULED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  NEGOTIATING: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  CLOSED_WON: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CLOSED_LOST: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
};

const statusLabels = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  VIEWING_SCHEDULED: 'Viewing Scheduled',
  NEGOTIATING: 'Negotiating',
  CLOSED_WON: 'Closed (Won)',
  CLOSED_LOST: 'Closed (Lost)'
};

const MOCK_INQUIRIES: Inquiry[] = [
  {
    id: '1',
    name: 'გიორგი მაისურაძე',
    email: 'giorgi@example.com',
    phone: '+995 599 123 456',
    message: 'ინტერესდება ბინით ვაკეში. გთხოვთ დამიკავშირდეთ.',
    propertyId: 'prop-123',
    propertyTitle: 'თანამედროვე 2-ოთახიანი ვაკეში',
    status: 'NEW',
    createdAt: '2026-02-20T10:30:00Z',
    assignedTo: 'agent-1'
  },
  {
    id: '2',
    name: 'Sophie Laurent',
    email: 'sophie@example.com',
    phone: '+33 6 12 34 56 78',
    message: 'Interested in the villa with pool. When can I schedule a viewing?',
    propertyId: 'prop-456',
    propertyTitle: 'Luxury Villa with Pool',
    status: 'CONTACTED',
    createdAt: '2026-02-19T15:20:00Z',
    assignedTo: 'agent-1'
  },
  {
    id: '3',
    name: 'Иван Петров',
    email: 'ivan@example.ru',
    message: 'Ищу квартиру для инвестиций. Рассмотрю варианты.',
    status: 'VIEWING_SCHEDULED',
    createdAt: '2026-02-18T09:00:00Z',
    assignedTo: 'agent-2'
  }
];

export default function LeadsDashboard() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | Inquiry['status']>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // Mock data for now - will be replaced with API call

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    // TODO: Replace with actual API call
    // fetch('/api/inquiries').then(res => res.json()).then(data => setInquiries(data))
    setTimeout(() => {
      setInquiries(MOCK_INQUIRIES);
      setIsLoading(false);
    }, 1000);
  }, [status, router]);

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesFilter = filter === 'ALL' || inquiry.status === filter;
    const matchesSearch = 
      inquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inquiry.propertyTitle && inquiry.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleStatusUpdate = async (inquiryId: string, newStatus: Inquiry['status']) => {
    // TODO: API call to update status
    setInquiries(prev => prev.map(inq => 
      inq.id === inquiryId ? { ...inq, status: newStatus } : inq
    ));
  };

  const stats = {
    total: inquiries.length,
    new: inquiries.filter(i => i.status === 'NEW').length,
    contacted: inquiries.filter(i => i.status === 'CONTACTED').length,
    viewing: inquiries.filter(i => i.status === 'VIEWING_SCHEDULED').length,
    negotiating: inquiries.filter(i => i.status === 'NEGOTIATING').length,
    closed: inquiries.filter(i => i.status === 'CLOSED_WON' || i.status === 'CLOSED_LOST').length
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('leadManagement') || 'Lead Management'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('manageInquiries') || 'Manage and track all property inquiries'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label={t('total') || 'Total'} value={stats.total} icon={Building} color="gray" />
        <StatCard label={t('new') || 'New'} value={stats.new} icon={Clock} color="blue" />
        <StatCard label={t('contacted') || 'Contacted'} value={stats.contacted} icon={Mail} color="yellow" />
        <StatCard label={t('viewing') || 'Viewing'} value={stats.viewing} icon={Calendar} color="purple" />
        <StatCard label={t('negotiating') || 'Negotiating'} value={stats.negotiating} icon={ArrowRight} color="orange" />
        <StatCard label={t('closed') || 'Closed'} value={stats.closed} icon={CheckCircle} color="green" />
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="ALL">{t('allStatuses') || 'All Statuses'}</option>
              {Object.keys(statusLabels).map(status => (
                <option key={status} value={status}>
                  {t(status.toLowerCase()) || statusLabels[status as keyof typeof statusLabels]}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('searchInquiries') || 'Search inquiries...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredInquiries.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              {t('noInquiries') || 'No inquiries found'}
            </div>
          ) : (
            filteredInquiries.map(inquiry => (
              <div
                key={inquiry.id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                onClick={() => setSelectedInquiry(inquiry)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {inquiry.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[inquiry.status]}`}>
                        {t(inquiry.status.toLowerCase()) || statusLabels[inquiry.status]}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {inquiry.email}
                      </span>
                      {inquiry.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {inquiry.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {inquiry.propertyTitle && (
                      <p className="text-sm text-primary-600 dark:text-primary-400 mb-2">
                        {t('interestedIn') || 'Interested in'}: {inquiry.propertyTitle}
                      </p>
                    )}

                    <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                      {inquiry.message}
                    </p>
                  </div>

                  <div className="ml-4">
                    <select
                      value={inquiry.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(inquiry.id, e.target.value as Inquiry['status']);
                      }}
                      className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {Object.keys(statusLabels).map(status => (
                        <option key={status} value={status}>
                          {t(status.toLowerCase()) || statusLabels[status as keyof typeof statusLabels]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  };

  return (
    <div className={`p-4 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium opacity-80">{label}</span>
        <Icon className="w-5 h-5 opacity-60" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
