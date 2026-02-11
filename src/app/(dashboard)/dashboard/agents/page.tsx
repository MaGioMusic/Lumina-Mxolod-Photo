'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { FiSearch, FiDownload, FiFilter, FiPlus, FiEye, FiEdit, FiTrash2, FiChevronLeft, FiChevronRight, FiCalendar, FiChevronDown, FiTrendingUp, FiArrowUp, FiUsers, FiTarget, FiHome, FiMoreHorizontal } from 'react-icons/fi';
import SinglePropertyMap from '@/app/(marketing)/properties/components/SinglePropertyMap';
import AgentDashboard from './components/AgentDashboard';
import AgentCrmDashboard from './components/AgentCrmDashboard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { AgentShell } from './components/agentShell';
import { useStaleFlag } from '@/hooks/useStaleFlag';
import AgentCalendar from './components/AgentCalendar';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  type: 'Buyer' | 'Seller' | 'Buyer & Seller' | 'Lead' | 'Inactive';
  propertyInterest: string;
  lastContact: string;
  status: 'Viewing Scheduled' | 'Offer Made' | 'Negotiating' | 'New Lead' | 'Follow-up Required';
  isSelected: boolean;
}

interface SavedSearch {
  id: string;
  name: string;
  alerts: boolean;
}

interface Viewing {
  id: string;
  property: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
}

type OfferStatus = 'Draft' | 'Sent' | 'In Review' | 'Accepted' | 'Rejected';
interface DocumentItem { id: string; name: string; size?: number; }
interface OfferItem { id: string; title: string; status: OfferStatus; }

interface AgentProperty {
  id: string;
  name: string;
  address: string;
  image: string;
  type: string;
  occupancy: 'Occupied' | 'Vacant' | 'Pending lease';
  yearBuilt: number;
  unitNumbers: string;
}

interface TopPerformingAgent {
  name: string;
  volume: string;
}

export default function AgentsPage() {
  const { theme } = useTheme();
  const { /* t */ } = useLanguage();
  const searchParams = useSearchParams();
  // const router = useRouter();
  
  const activeTab = searchParams?.get('tab') || 'dashboard';
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [dateRange, setDateRange] = useState<'Last 30 Days' | 'Last 12 Months' | 'Year to Date' | 'Custom Range'>('Last 12 Months');

  // Chart data
  const salesTrendData = [
    { month: 'Jan', sales: 1.8 },
    { month: 'Feb', sales: 2.1 },
    { month: 'Mar', sales: 2.3 },
    { month: 'Apr', sales: 2.0 },
    { month: 'May', sales: 2.4 },
    { month: 'Jun', sales: 2.7 },
    { month: 'Jul', sales: 2.5 },
    { month: 'Aug', sales: 2.8 },
    { month: 'Sep', sales: 2.6 },
    { month: 'Oct', sales: 2.9 },
    { month: 'Nov', sales: 2.7 },
    { month: 'Dec', sales: 3.0 },
  ];

  const clientActivityData = [
    { month: 'Jan', newLeads: 45, viewings: 32, offers: 18 },
    { month: 'Feb', newLeads: 52, viewings: 38, offers: 22 },
    { month: 'Mar', newLeads: 48, viewings: 42, offers: 25 },
    { month: 'Apr', newLeads: 55, viewings: 35, offers: 20 },
    { month: 'May', newLeads: 62, viewings: 48, offers: 28 },
    { month: 'Jun', newLeads: 58, viewings: 52, offers: 32 },
  ];

  const propertyTypeData = [
    { name: 'Apartments', value: 45, color: '#60A5FA' },
    { name: 'Houses', value: 30, color: '#A78BFA' },
    { name: 'Condos', value: 15, color: '#34D399' },
    { name: 'Commercial', value: 10, color: '#93C5FD' },
  ];

  const topPerformingAgents: TopPerformingAgent[] = [
    { name: 'Sarah Wilson', volume: '$4.2M' },
    { name: 'Michael Brown', volume: '$3.8M' },
    { name: 'Emma Johnson', volume: '$3.5M' },
    { name: 'James Chen', volume: '$3.1M' },
  ];

  const getAgentAvatarUrl = (name: string) =>
    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&radius=50&backgroundColor=d4af37,b8860b&textColor=0f172a`;

  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      phone: '+1 (555) 123-4567',
      avatar: '/images/photos/contact-1.jpg',
      type: 'Buyer',
      propertyInterest: 'Modern villa in Beverly Hills area. Budget around $3M.',
      lastContact: '2 hours ago',
      status: 'Viewing Scheduled',
      isSelected: false
    },
    {
      id: '2',
      name: 'Emma Wilson',
      email: 'emma.wilson@example.com',
      phone: '+1 (555) 987-6543',
      avatar: '/images/photos/contact-2.jpg',
      type: 'Buyer & Seller',
      propertyInterest: 'Interested in Coastal Paradise property. Made an offer of $3.8M.',
      lastContact: '1 day ago',
      status: 'Offer Made',
      isSelected: false
    },
    {
      id: '3',
      name: 'James Chen',
      email: 'james.chen@example.com',
      phone: '+1 (555) 456-7890',
      avatar: '/images/photos/contact-3.jpg',
      type: 'Seller',
      propertyInterest: 'Selling City Penthouse property. Currently in negotiations.',
      lastContact: '3 days ago',
      status: 'Negotiating',
      isSelected: false
    },
    {
      id: '4',
      name: 'Sophia Rodriguez',
      email: 'sophia.r@example.com',
      phone: '+1 (555) 789-0123',
      avatar: '/images/photos/contact-4.jpg',
      type: 'Lead',
      propertyInterest: 'New lead interested in luxury properties in the Malibu area.',
      lastContact: '1 week ago',
      status: 'New Lead',
      isSelected: false
    },
    {
      id: '5',
      name: 'David Kim',
      email: 'david.kim@example.com',
      phone: '+1 (555) 234-5678',
      avatar: '/images/photos/contact-1.jpg',
      type: 'Inactive',
      propertyInterest: 'Was interested in several properties but has been unresponsive.',
      lastContact: '1 month ago',
      status: 'Follow-up Required',
      isSelected: false
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Clients');
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'saved' | 'favorites' | 'viewings' | 'documents' | 'chat'>('overview');
  const [activeClient, setActiveClient] = useState<Client | null>(null);

  // Drawer-scoped states
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [savedFormOpen, setSavedFormOpen] = useState(false);
  const [savedDraftLocation, setSavedDraftLocation] = useState('');
  const [savedDraftBeds, setSavedDraftBeds] = useState('');
  const [savedDraftMaxPrice, setSavedDraftMaxPrice] = useState('');

  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [viewingModalOpen, setViewingModalOpen] = useState(false);
  const [viewingDraftProperty, setViewingDraftProperty] = useState('');
  const [viewingDraftDate, setViewingDraftDate] = useState('');
  const [viewingDraftTime, setViewingDraftTime] = useState('');

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [offers, setOffers] = useState<OfferItem[]>([{ id: 'of1', title: 'Primary Offer', status: 'Draft' }]);

  // Properties tab state
  const [propStatusFilter, setPropStatusFilter] = useState<'All' | 'Vacant' | 'Occupied' | 'Pending lease'>('All');
  const [properties] = useState<AgentProperty[]>([
    {
      id: 'p1',
      name: 'Downtown Luxe Apartment',
      address: '101 Skyline Drive, Apt 23B, San Francisco, CA, 94105, USA',
      image: '/images/properties/property-1.jpg',
      type: 'Residential - Apartment',
      occupancy: 'Occupied',
      yearBuilt: 2018,
      unitNumbers: '23B'
    },
    {
      id: 'p2',
      name: 'Sunset Retail Plaza',
      address: '456 Commerce Lane, Miami, FL, 33101, USA',
      image: '/images/properties/property-2.jpg',
      type: 'Commercial - Retail',
      occupancy: 'Occupied',
      yearBuilt: 2015,
      unitNumbers: 'Suite 100, Suite 102'
    },
    {
      id: 'p3',
      name: 'Willow Creek Townhouse',
      address: '89 Greenview Avenue, Seattle, WA, 98101, USA',
      image: '/images/properties/property-3.jpg',
      type: 'Residential - Townhouse',
      occupancy: 'Vacant',
      yearBuilt: 2010,
      unitNumbers: 'N/A'
    },
    {
      id: 'p4',
      name: 'Palm Garden Villas',
      address: 'Residential - Multi-Unit Complex',
      image: '/images/properties/property-4.jpg',
      type: 'Residential - Multi-Unit Complex',
      occupancy: 'Occupied',
      yearBuilt: 2020,
      unitNumbers: 'Units 1-10'
    },
    {
      id: 'p5',
      name: 'Greenfield Office Park',
      address: '789 Corporate Blvd, Austin, TX, 73301, USA',
      image: '/images/properties/property-5.jpg',
      type: 'Commercial - Office',
      occupancy: 'Pending lease',
      yearBuilt: 2023,
      unitNumbers: 'Suite 300'
    }
  ]);

  const resetDrawerData = () => {
    setSavedSearches([]);
    setSavedFormOpen(false);
    setSavedDraftLocation('');
    setSavedDraftBeds('');
    setSavedDraftMaxPrice('');
    setViewings([]);
    setViewingModalOpen(false);
    setViewingDraftProperty('');
    setViewingDraftDate('');
    setViewingDraftTime('');
  };

  const onOpenDrawerForClient = (client: Client) => {
    setActiveClient(client);
    resetDrawerData();
    setDrawerTab('overview');
    setDrawerOpen(true);
  };

  const addSavedSearch = () => {
    if (!savedDraftLocation) return;
    const name = `${savedDraftLocation}${savedDraftBeds ? ' • ' + savedDraftBeds + ' beds' : ''}${savedDraftMaxPrice ? ' • ≤' + savedDraftMaxPrice : ''}`;
    setSavedSearches(prev => [{ id: Date.now().toString(), name, alerts: true }, ...prev]);
    setSavedDraftLocation('');
    setSavedDraftBeds('');
    setSavedDraftMaxPrice('');
    setSavedFormOpen(false);
  };

  const toggleSavedAlert = (id: string) => {
    setSavedSearches(prev => prev.map(s => (s.id === id ? { ...s, alerts: !s.alerts } : s)));
  };

  const addViewing = () => {
    if (!viewingDraftDate || !viewingDraftTime || !viewingDraftProperty) return;
    setViewings(prev => [{ id: Date.now().toString(), property: viewingDraftProperty, date: viewingDraftDate, time: viewingDraftTime }, ...prev]);
    setViewingModalOpen(false);
    setViewingDraftProperty('');
    setViewingDraftDate('');
    setViewingDraftTime('');
  };

  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  const toICSDate = (date: string, time: string) => {
    const dt = new Date(`${date}T${time}:00`);
    return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}00Z`;
  };
  const exportICS = (v: Viewing) => {
    const dtStart = toICSDate(v.date, v.time);
    // 1 hour duration
    const dt = new Date(`${v.date}T${v.time}:00`);
    dt.setHours(dt.getHours() + 1);
    const dtEnd = `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}00Z`;
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Lumina Estate//EN\nBEGIN:VEVENT\nUID:${Date.now()}@lumina\nSUMMARY:${v.property} Viewing\nDTSTART:${dtStart}\nDTEND:${dtEnd}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `viewing-${v.property}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const onUploadDocs: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    const list: DocumentItem[] = Array.from(files).map((f) => ({ id: `${f.name}-${Date.now()}`, name: f.name, size: f.size }));
    setDocuments((prev) => [...list, ...prev]);
    e.currentTarget.value = '';
  };

  const advanceOffer = (id: string, dir: 1 | -1) => {
    const order: OfferStatus[] = ['Draft', 'Sent', 'In Review', 'Accepted', 'Rejected'];
    setOffers((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const idx = order.indexOf(o.status);
        const nextIdx = Math.min(order.length - 1, Math.max(0, idx + dir));
        return { ...o, status: order[nextIdx] };
      })
    );
  };

  const sanitizeContact = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

  const toggleClientSelection = (clientId: string) => {
    setClients(clients.map(client => 
      client.id === clientId 
        ? { ...client, isSelected: !client.isSelected }
        : client
    ));
  };

  const toggleSelectAll = () => {
    const allSelected = clients.every(client => client.isSelected);
    setClients(clients.map(client => ({ ...client, isSelected: !allSelected })));
  };

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'Buyer':
        return 'bg-blue-100 text-blue-800';
      case 'Seller':
        return 'bg-green-100 text-green-800';
      case 'Buyer & Seller':
        return 'bg-yellow-100 text-yellow-800';
      case 'Lead':
        return 'bg-cyan-100 text-cyan-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Viewing Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Offer Made':
        return 'bg-yellow-100 text-yellow-800';
      case 'Negotiating':
        return 'bg-purple-100 text-purple-800';
      case 'New Lead':
        return 'bg-gray-100 text-gray-800';
      case 'Follow-up Required':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOccupancyBadgeStyle = (s: AgentProperty['occupancy']) => {
    switch (s) {
      case 'Occupied':
        return 'bg-green-100 text-green-800';
      case 'Vacant':
        return 'bg-blue-100 text-blue-800';
      case 'Pending lease':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const { isStale, touch } = useStaleFlag('agents_filters_updated_at', 1000 * 60 * 60 * 24 * 7);

  if (activeTab === 'analytics') {
    return (
      <AgentShell title="Analytics Dashboard">
        <div className={`flex-1 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header with Controls */}
        <div className="flex items-center justify-between p-6 relative">
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
            Analytics Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button onClick={()=>setDateMenuOpen(v=>!v)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50">
                <FiCalendar className="w-4 h-4 text-blue-600" />
                <span className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{dateRange}</span>
                <FiChevronDown className="w-4 h-4 text-blue-600" />
              </button>
              <AnimatePresence>
                {dateMenuOpen && (
                  <motion.div initial={{opacity:0, y:-4}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-4}} className={`absolute right-0 mt-2 w-44 rounded-lg shadow-lg ring-1 ring-black/5 z-10 ${theme==='dark'?'bg-dark-bg-secondary':'bg-white'}`}>
                    {(['Last 30 Days','Last 12 Months','Year to Date','Custom Range'] as const).map(opt=> (
                      <button key={opt} onClick={()=>{setDateRange(opt); setDateMenuOpen(false);}} className={`w-full text-left px-3 py-2 text-sm ${theme==='dark'?'hover:bg-dark-bg':'hover:bg-gray-50'}`}>{opt}</button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-2 cursor-pointer">
              <FiFilter className="w-4 h-4 text-blue-600" />
              <span className="text-blue-600">Filter</span>
            </div>
            <div className="relative">
              <button onClick={()=>setExportMenuOpen(v=>!v)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
                <FiDownload className="w-4 h-4" />
                Export
              </button>
              <AnimatePresence>
                {exportMenuOpen && (
                  <motion.div initial={{opacity:0, y:-4}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-4}} className={`absolute right-0 mt-2 w-40 rounded-lg shadow-lg ring-1 ring-black/5 z-10 ${theme==='dark'?'bg-dark-bg-secondary':'bg-white'}`}>
                    {['Export CSV','Export XLSX','Export PDF'].map(opt => (
                      <button key={opt} onClick={()=>setExportMenuOpen(false)} className={`w-full text-left px-3 py-2 text-sm ${theme==='dark'?'hover:bg-dark-bg text-dark-text':'hover:bg-gray-50 text-gray-800'}`}>{opt}</button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6 mb-6">
          <motion.div whileHover={{ y: -2 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className={`${theme === 'dark' ? 'bg-dark-bg-secondary' : 'bg-white'} rounded-2xl p-6 shadow-lg ring-1 ring-black/5`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm font-medium`}>Total Sales</h3>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <FiTrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-2`}>$24.5M</div>
            <div className="flex items-center gap-2">
              <FiArrowUp className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-600 font-medium">+12.5%</span>
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>vs last year</span>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className={`${theme === 'dark' ? 'bg-dark-bg-secondary' : 'bg-white'} rounded-2xl p-6 shadow-lg ring-1 ring-black/5`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm font-medium`}>Active Clients</h3>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <FiUsers className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-2`}>1,248</div>
            <div className="flex items-center gap-2">
              <FiArrowUp className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-600 font-medium">+8.2%</span>
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>vs last month</span>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }} className={`${theme === 'dark' ? 'bg-dark-bg-secondary' : 'bg-white'} rounded-2xl p-6 shadow-lg ring-1 ring-black/5`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm font-medium`}>Conversion Rate</h3>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <FiTarget className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-2`}>18.6%</div>
            <div className="flex items-center gap-2">
              <FiArrowUp className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-600 font-medium">+2.4%</span>
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>vs last quarter</span>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className={`${theme === 'dark' ? 'bg-dark-bg-secondary' : 'bg-white'} rounded-2xl p-6 shadow-lg ring-1 ring-black/5`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm font-medium`}>Avg. Property Value</h3>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <FiHome className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-2`}>$1.8M</div>
            <div className="flex items-center gap-2">
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>vs last month</span>
            </div>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 mb-6">
          {/* Sales Trend Chart */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className={`${theme === 'dark' ? 'bg-dark-bg-secondary' : 'bg-white'} rounded-2xl p-6 shadow-lg ring-1 ring-black/5`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Sales Trend</h3>
              <FiMoreHorizontal className="w-4 h-4 text-blue-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#53433F" />
                <YAxis stroke="#53433F" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1F2937' : 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Client Activity Chart */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }} className={`${theme === 'dark' ? 'bg-dark-bg-secondary' : 'bg-white'} rounded-2xl p-6 shadow-lg ring-1 ring-black/5`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Client Activity</h3>
              <FiMoreHorizontal className="w-4 h-4 text-blue-600" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={clientActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#53433F" />
                <YAxis stroke="#53433F" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1F2937' : 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="newLeads" fill="#60A5FA" radius={[4, 4, 0, 0]} />
                <Bar dataKey="viewings" fill="#A78BFA" radius={[4, 4, 0, 0]} />
                <Bar dataKey="offers" fill="#34D399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-blue-600">New Leads</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-300 rounded-full"></div>
                <span className="text-purple-500">Property Viewings</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-emerald-600">Offers Made</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 mb-6">
          {/* Property Type Distribution */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }} className={`${theme === 'dark' ? 'bg-dark-bg-secondary' : 'bg-white'} rounded-2xl p-6 shadow-lg ring-1 ring-black/5`}>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-6`}>Property Type Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={propertyTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {propertyTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {propertyTypeData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.name} ({item.value}%)
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Property Location */}
          <div className={`${theme === 'dark' ? 'bg-dark-bg-secondary' : 'bg-white'} rounded-2xl p-6 shadow-lg ring-1 ring-black/5`}>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-6`}>Property Location</h3>
            <div className="h-[250px] rounded-lg overflow-hidden">
              <SinglePropertyMap 
                coordinates={{ lat: 41.7151, lng: 44.7661 }} 
                propertyTitle="Tbilisi Center" 
                propertyPrice="" 
                propertyAddress="Tbilisi, Georgia" 
              />
            </div>
          </div>

          {/* Top Performing Agents */}
          <div className={`${theme === 'dark' ? 'bg-dark-bg-secondary' : 'bg-white'} rounded-2xl p-6 shadow-lg ring-1 ring-black/5`}>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-6`}>Top Performing Agents</h3>
            <div className="space-y-4">
              {topPerformingAgents.map((agent) => (
                <div key={agent.name} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={getAgentAvatarUrl(agent.name)}
                      alt={agent.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0 bg-gray-100"
                      loading="lazy"
                      onError={(e) => {
                        // If the avatar service fails, fall back to a simple transparent pixel
                        // to avoid the browser showing a broken-image icon + alt text.
                        e.currentTarget.src =
                          'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
                      }}
                    />
                    <span className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} truncate`}>
                      {agent.name}
                    </span>
                  </div>
                  <span className="text-blue-600 dark:text-blue-400 font-medium tabular-nums shrink-0">
                    {agent.volume}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </AgentShell>
    );
  }

  if (activeTab === 'properties') {
    const visibleProperties =
      propStatusFilter === 'All'
        ? properties
        : properties.filter(p => p.occupancy === propStatusFilter);

    return (
      <AgentShell title="Properties Management">
        <div className={`${theme === 'dark' ? 'bg-dark-bg' : 'bg-gray-50'} flex-1`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>
                Properties Management
              </h1>
              <button className="bg-primary-400 hover:bg-primary-500 text-white px-4 py-2 rounded-lg">
                + Add Property
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              {(['All','Vacant','Occupied','Pending lease'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setPropStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition
                    ${propStatusFilter === st
                      ? 'bg-primary-400 text-white'
                      : theme === 'dark'
                        ? 'bg-dark-bg-secondary text-dark-text border border-dark-border hover:bg-dark-bg'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className={`${theme === 'dark' ? 'bg-dark-bg-secondary' : 'bg-white'} rounded-xl shadow-sm overflow-hidden`}>
              <div className={`${theme === 'dark' ? 'bg-dark-bg border-dark-border' : 'bg-gray-50 border-gray-200'} border-b px-6 py-3`}>
                <div className="grid grid-cols-12 gap-6">
                  <div className={`col-span-5 text-sm font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-700'}`}>Property Name</div>
                  <div className={`col-span-3 text-sm font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-700'}`}>Type</div>
                  <div className={`col-span-2 text-sm font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-700'}`}>Occupancy</div>
                  <div className={`col-span-1 text-sm font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-700'}`}>Year Built</div>
                  <div className={`col-span-1 text-sm font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-700'}`}>Unit Number(s)</div>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {visibleProperties.map(p => (
                  <div key={p.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-12 gap-6 items-center">
                      <div className="col-span-5 flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-16 h-12 rounded-lg object-cover" />
                        <div>
                          <div className={`font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>{p.name}</div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}`}>{p.address}</div>
                        </div>
                      </div>
                      <div className={`col-span-3 text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`}>
                        {p.type}
                      </div>
                      <div className="col-span-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getOccupancyBadgeStyle(p.occupancy)}`}>
                          {p.occupancy}
                        </span>
                      </div>
                      <div className={`col-span-1 text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`}>
                        {p.yearBuilt}
                      </div>
                      <div className={`col-span-1 text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`}>
                        {p.unitNumbers}
                      </div>
                    </div>
                  </div>
                ))}
                {visibleProperties.length === 0 && (
                  <div className="px-6 py-12 text-center text-sm text-gray-500">No properties match this filter.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AgentShell>
    );
  }

  if (activeTab === 'calendar') {
    return (
      <AgentShell title="Calendar">
        <div className={`${theme === 'dark' ? 'bg-dark-bg' : 'bg-gray-50'} flex-1`}>
          <div className="p-6">
            <h1 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>Calendar</h1>
            <AgentCalendar />
          </div>
        </div>
      </AgentShell>
    );
  }

  if (activeTab === 'settings') {
    return (
      <AgentShell title="Agent Settings">
        <div className={`flex-1 ${theme === 'dark' ? 'bg-dark-bg' : 'bg-gray-50'}`}>
          <div className="p-6">
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>
              Agent Settings
            </h1>
            <p className={`mt-4 ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`}>
              Settings content coming soon...
            </p>
          </div>
        </div>
      </AgentShell>
    );
  }

  // Placeholder pages for other tabs (temporary)
  if (activeTab === 'projects') {
    return (
      <AgentShell title="Projects">
        <div className={`flex-1 ${theme === 'dark' ? 'bg-dark-bg' : 'bg-gray-50'}`}>
          <div className="p-6">
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>Projects</h1>
            <p className={`${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'} mt-4`}>Projects content coming soon...</p>
          </div>
        </div>
      </AgentShell>
    );
  }

  if (activeTab === 'offers') {
    return (
      <AgentShell title="Offers">
        <div className={`flex-1 ${theme === 'dark' ? 'bg-dark-bg' : 'bg-gray-50'}`}>
          <div className="p-6">
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>Offers</h1>
            <p className={`${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'} mt-4`}>Offers content coming soon...</p>
          </div>
        </div>
      </AgentShell>
    );
  }

  if (activeTab === 'agreements') {
    return (
      <AgentShell title="Agreements">
        <div className={`flex-1 ${theme === 'dark' ? 'bg-dark-bg' : 'bg-gray-50'}`}>
          <div className="p-6">
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>Agreements</h1>
            <p className={`${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'} mt-4`}>Agreements content coming soon...</p>
          </div>
        </div>
      </AgentShell>
    );
  }

  if (activeTab === 'contacts') {
    return (
      <AgentShell title="Contacts & Orgs">
        <div className={`flex-1 ${theme === 'dark' ? 'bg-dark-bg' : 'bg-gray-50'}`}>
          <div className="p-6">
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>Contacts & Orgs</h1>
            <p className={`${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'} mt-4`}>Contacts & Organizations content coming soon...</p>
          </div>
        </div>
      </AgentShell>
    );
  }

  if (activeTab === 'brokers') {
    return (
      <AgentShell title="Brokers & Agents">
        <div className={`flex-1 ${theme === 'dark' ? 'bg-dark-bg' : 'bg-gray-50'}`}>
          <div className="p-6">
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>Brokers & Agents</h1>
            <p className={`${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'} mt-4`}>Brokers & Agents content coming soon...</p>
          </div>
        </div>
      </AgentShell>
    );
  }

  if (activeTab === 'campaigns') {
    return (
      <AgentShell title="Campaigns">
        <div className={`flex-1 ${theme === 'dark' ? 'bg-dark-bg' : 'bg-gray-50'}`}>
          <div className="p-6">
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>Campaigns</h1>
            <p className={`${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'} mt-4`}>Campaigns content coming soon...</p>
          </div>
        </div>
      </AgentShell>
    );
  }

  if (activeTab === 'documents') {
    return (
      <AgentShell title="Documents">
        <div className={`flex-1 ${theme === 'dark' ? 'bg-dark-bg' : 'bg-gray-50'}`}>
          <div className="p-6">
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>Documents</h1>
            <p className={`${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'} mt-4`}>Documents content coming soon...</p>
          </div>
        </div>
      </AgentShell>
    );
  }

  if (activeTab === 'dashboard') {
    return (
      <AgentShell title="Agent Dashboard">
        <div className="flex-1">
          <AgentDashboard />
        </div>
      </AgentShell>
    );
  }

  if (activeTab === 'crm') {
    return (
      <AgentShell title="CRM Dashboard">
        <div className="flex-1">
          <AgentCrmDashboard />
        </div>
      </AgentShell>
    );
  }

  return (
    <AgentShell title="Clients Management">
      <div className={`flex-1 ${theme === 'dark' ? 'bg-dark-bg' : 'bg-gray-50'}`}>
        <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>
            Clients Management
          </h1>
          <div className="flex items-center gap-4">
            <button className="bg-primary-400 hover:bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <FiPlus className="w-4 h-4" />
              Add New Client
            </button>
            <button className={`${theme === 'dark' ? 'bg-dark-bg-secondary text-dark-text border-dark-border' : 'bg-gray-100 text-gray-700 border-gray-300'} border px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors`} onClick={touch}>
              <FiDownload className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

          {isStale && (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 text-amber-800 px-3 py-2 text-sm flex items-center justify-between">
              <span>ფილტრები შესაძლოა მოძველებულია. განაახლე მონაცემები.</span>
              <button onClick={touch} className="px-3 py-1 rounded bg-amber-600 text-white hover:bg-amber-700">განახლება</button>
            </div>
          )}

        <div className="flex items-center gap-4 mb-6">
          <div className={`flex-1 relative ${theme === 'dark' ? 'bg-dark-bg-secondary border-dark-border' : 'bg-white border-gray-300'} border rounded-lg`}>
            <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search clients by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg ${theme === 'dark' ? 'bg-dark-bg-secondary text-dark-text placeholder-dark-text-secondary' : 'bg-white text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
            />
          </div>
          <button className={`${theme === 'dark' ? 'bg-dark-bg-secondary text-dark-text border-dark-border' : 'bg-gray-100 text-gray-700 border-gray-300'} border px-4 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors`} onClick={touch}>
            <FiFilter className="w-4 h-4" />
            Filter
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {['All Clients', 'Active', 'Leads', 'Buyers', 'Sellers', 'Recent Activity'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeFilter === filter
                  ? 'bg-primary-400 text-white'
                  : theme === 'dark'
                  ? 'bg-dark-bg-secondary text-dark-text border border-dark-border hover:bg-dark-bg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className={`${theme === 'dark' ? 'bg-dark-bg-secondary' : 'bg-white'} rounded-xl shadow-sm overflow-hidden`}>
          <div className={`${theme === 'dark' ? 'bg-dark-bg border-dark-border' : 'bg-gray-50 border-gray-200'} border-b px-6 py-4`}>
            <div className="flex items-center gap-6">
              <input
                type="checkbox"
                checked={clients.every(client => client.isSelected)}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
              />
              <div className="flex-1 grid grid-cols-6 gap-6">
                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-700'}`}>Client</div>
                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-700'}`}>Type</div>
                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-700'}`}>Property Interest</div>
                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-700'}`}>Last Contact</div>
                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-700'}`}>Status</div>
                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-700'} text-center`}>Actions</div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {clients.map((client) => (
              <div key={client.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-6">
                  <input
                    type="checkbox"
                    checked={client.isSelected}
                    onChange={() => toggleClientSelection(client.id)}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div className="flex-1 grid grid-cols-6 gap-6 items-center">
                    <div className="flex items-center gap-3">
                      <img
                        src={client.avatar}
                        alt={client.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className={`font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>
                          {client.name}
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}`}>
                          {client.email}
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}`}>
                          {client.phone}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeBadgeStyle(client.type)}`}>
                        {client.type}
                      </span>
                    </div>

                    <div className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'} line-clamp-2`}>
                      {client.propertyInterest}
                    </div>

                    <div className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`}>
                      {client.lastContact}
                    </div>

                    <div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeStyle(client.status)}`}>
                        {client.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => onOpenDrawerForClient(client)} className="p-1 text-primary-500 hover:bg-cream-100 rounded transition-colors">
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-primary-500 hover:bg-cream-100 rounded transition-colors">
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-primary-500 hover:bg-cream-100 rounded transition-colors">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`}>
            Showing 1-5 of 1,024 clients
          </div>
          <div className="flex items-center gap-2">
            <button className={`p-2 ${theme === 'dark' ? 'border-dark-border hover:bg-dark-bg' : 'border-gray-300 hover:bg-gray-50'} border rounded-md transition-colors`}>
              <FiChevronLeft className="w-4 h-4" />
            </button>
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  currentPage === page
                    ? 'bg-primary-400 text-white'
                    : theme === 'dark'
                    ? 'border-dark-border text-dark-text hover:bg-dark-bg'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } border`}
              >
                {page}
              </button>
            ))}
            <button className={`p-2 ${theme === 'dark' ? 'border-dark-border hover:bg-dark-bg' : 'border-gray-300 hover:bg-gray-50'} border rounded-md transition-colors`}>
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        </div>

      {/* Details Drawer */}
      <AnimatePresence>
        {drawerOpen && activeClient && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className={`absolute right-0 top-0 h-full w-full md:w-[560px] ${theme === 'dark' ? 'bg-dark-bg' : 'bg-white'} shadow-xl border-l ${theme === 'dark' ? 'border-dark-border' : 'border-gray-200'}`}>
              <div className={`flex items-center justify-between px-5 py-4 border-b ${theme === 'dark' ? 'border-dark-border' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <img src={activeClient.avatar} alt={activeClient.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className={`font-semibold ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>{activeClient.name}</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}`}>{activeClient.email}</div>
                  </div>
                </div>
                <button onClick={() => setDrawerOpen(false)} className={`px-3 py-1.5 rounded-lg border ${theme === 'dark' ? 'border-dark-border text-dark-text hover:bg-dark-bg-secondary' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>Close</button>
              </div>

              <div className={`px-5 py-3 border-b ${theme === 'dark' ? 'border-dark-border' : 'border-gray-200'} flex items-center gap-2 overflow-x-auto`}>
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'saved', label: 'Saved Searches' },
                  { id: 'favorites', label: 'Favorites' },
                  { id: 'viewings', label: 'Viewings' },
                  { id: 'documents', label: 'Documents/Offers' },
                  { id: 'chat', label: 'Chat' }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setDrawerTab(tab.id as any)} className={`px-3 py-1.5 rounded-lg text-sm ${drawerTab === tab.id ? 'bg-primary-400 text-white' : theme === 'dark' ? 'text-dark-text hover:bg-dark-bg-secondary' : 'text-gray-700 hover:bg-gray-100'}`}>{tab.label}</button>
                ))}
              </div>

              <div className="p-5 space-y-6 overflow-y-auto h-[calc(100%-140px)]">
                {drawerTab === 'overview' && (
                  <div className="space-y-3 text-sm">
                    <div className={`${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`}>{activeClient.propertyInterest}</div>
                    <div className={`${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`}>Last contact: {activeClient.lastContact}</div>
                    <div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeBadgeStyle(activeClient.type)}`}>{activeClient.type}</span>
                    </div>
                  </div>
                )}

                {drawerTab === 'saved' && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`text-sm font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>Saved searches</div>
                      <button onClick={() => setSavedFormOpen(true)} className="px-2 py-1 text-xs rounded bg-primary-400 text-white">Add</button>
                    </div>
                    {savedFormOpen && (
                      <div className={`p-3 rounded-lg mb-3 ${theme === 'dark' ? 'bg-dark-bg-secondary' : 'bg-gray-50'}`}>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <input value={savedDraftLocation} onChange={(e)=>setSavedDraftLocation(e.target.value)} placeholder="უბანი" className={`px-2 py-2 rounded border ${theme==='dark'?'bg-dark-bg text-dark-text border-dark-border':'bg-white text-gray-800 border-gray-300'}`} />
                          <input value={savedDraftBeds} onChange={(e)=>setSavedDraftBeds(e.target.value)} placeholder="საძინებლები" className={`px-2 py-2 rounded border ${theme==='dark'?'bg-dark-bg text-dark-text border-dark-border':'bg-white text-gray-800 border-gray-300'}`} />
                          <input value={savedDraftMaxPrice} onChange={(e)=>setSavedDraftMaxPrice(e.target.value)} placeholder="ბიუჯეტი ≤" className={`px-2 py-2 rounded border ${theme==='dark'?'bg-dark-bg text-dark-text border-dark-border':'bg-white text-gray-800 border-gray-300'}`} />
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button onClick={addSavedSearch} className="px-3 py-1.5 text-xs rounded bg-primary-400 text-white">შენახვა</button>
                          <button onClick={()=>setSavedFormOpen(false)} className={`px-3 py-1.5 text-xs rounded border ${theme==='dark'?'border-dark-border text-dark-text':'border-gray-300 text-gray-700'}`}>გაუქმება</button>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      {savedSearches.map(s => (
                        <div key={s.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-dark-bg-secondary' : 'bg-gray-50'} flex items-center justify-between`}>
                          <span className={`${theme === 'dark' ? 'text-dark-text' : 'text-gray-800'}`}>{s.name}</span>
                          <button onClick={()=>toggleSavedAlert(s.id)} className={`px-2 py-1 text-xs rounded ${s.alerts ? 'bg-green-600 text-white' : theme==='dark'?'bg-dark-bg text-dark-text border border-dark-border':'bg-white text-gray-800 border border-gray-200'}`}>{s.alerts ? 'Alerts On' : 'Alerts Off'}</button>
                        </div>
                      ))}
                      {savedSearches.length===0 && <div className={`text-xs ${theme==='dark'?'text-dark-text-secondary':'text-gray-500'}`}>ჯერ არაფერია შენახული.</div>}
                    </div>
                  </div>
                )}

                {drawerTab === 'viewings' && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`text-sm font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>Scheduled viewings</div>
                      <button className="px-2 py-1 text-xs rounded bg-primary-400 text-white">New</button>
                    </div>
                    <div className="space-y-2">
                      {viewings.map(v => (
                        <div key={v.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-dark-bg-secondary' : 'bg-gray-50'} flex items-center justify-between`}>
                          <span className={`${theme === 'dark' ? 'text-dark-text' : 'text-gray-800'}`}>{v.property} • {v.date} {v.time}</span>
                          <button onClick={()=>exportICS(v)} className="px-2 py-1 text-xs rounded bg-primary-400 text-white">ICS</button>
                        </div>
                      ))}
                      {viewings.length===0 && <div className={`text-xs ${theme==='dark'?'text-dark-text-secondary':'text-gray-500'}`}>ჯერ არ არის დაგეგმილი დათვალიერება.</div>}
                    </div>
                    {viewingModalOpen && (
                      <div className="mt-3 p-3 rounded-lg border bg-white text-sm">
                        <div className="grid grid-cols-3 gap-2">
                          <input value={viewingDraftProperty} onChange={(e)=>setViewingDraftProperty(e.target.value)} placeholder="ქონება" className="px-2 py-2 rounded border border-gray-300" />
                          <input type="date" value={viewingDraftDate} onChange={(e)=>setViewingDraftDate(e.target.value)} className="px-2 py-2 rounded border border-gray-300" />
                          <input type="time" value={viewingDraftTime} onChange={(e)=>setViewingDraftTime(e.target.value)} className="px-2 py-2 rounded border border-gray-300" />
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button onClick={addViewing} className="px-3 py-1.5 rounded bg-primary-400 text-white">შენახვა</button>
                          <button onClick={()=>setViewingModalOpen(false)} className="px-3 py-1.5 rounded border border-gray-300">გაუქმება</button>
                        </div>
                      </div>
                    )}
                    <div className="mt-3">
                      <button onClick={()=>setViewingModalOpen(true)} className="px-2 py-1 text-xs rounded bg-primary-400 text-white">New</button>
                    </div>
                  </div>
                )}

                {drawerTab === 'favorites' && (
                  <div className="space-y-2">
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-dark-bg-secondary' : 'bg-gray-50'}`}>
                      <div className={`text-sm font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>ვაკე • თბილი ინტერიერი</div>
                      <input placeholder="შენიშვნა..." className={`mt-2 w-full px-3 py-2 rounded ${theme === 'dark' ? 'bg-dark-bg text-dark-text' : 'bg-white text-gray-800'} border ${theme === 'dark' ? 'border-dark-border' : 'border-gray-200'}`} />
                    </div>
                  </div>
                )}

                {drawerTab === 'documents' && (
                  <div className="space-y-4">
                    <div>
                      <div className={`text-sm font-medium mb-2 ${theme==='dark'?'text-dark-text':'text-gray-900'}`}>Documents</div>
                      <input type="file" multiple onChange={onUploadDocs} className={`text-xs ${theme==='dark'?'text-dark-text-secondary':'text-gray-600'}`} />
                      <div className="mt-2 space-y-2">
                        {documents.map(d => (
                          <div key={d.id} className={`p-3 rounded-lg ${theme==='dark'?'bg-dark-bg-secondary':'bg-gray-50'} text-sm flex items-center justify-between`}>
                            <span className={`${theme==='dark'?'text-dark-text':'text-gray-800'}`}>{d.name}</span>
                            <a href="#" className="text-primary-500 text-xs">Download</a>
                          </div>
                        ))}
                        {documents.length===0 && <div className={`text-xs ${theme==='dark'?'text-dark-text-secondary':'text-gray-500'}`}>No files uploaded yet.</div>}
                      </div>
                    </div>
                    <div>
                      <div className={`text-sm font-medium mb-2 ${theme==='dark'?'text-dark-text':'text-gray-900'}`}>Offers</div>
                      <div className="space-y-2">
                        {offers.map(o => (
                          <div key={o.id} className={`p-3 rounded-lg ${theme==='dark'?'bg-dark-bg-secondary':'bg-gray-50'} text-sm flex items-center justify-between`}>
                            <span className={`${theme==='dark'?'text-dark-text':'text-gray-800'}`}>{o.title} • {o.status}</span>
                            <div className="flex items-center gap-2">
                              <button onClick={()=>advanceOffer(o.id,-1)} className={`px-2 py-1 text-xs rounded border ${theme==='dark'?'border-dark-border text-dark-text':'border-gray-300 text-gray-700'}`}>Back</button>
                              <button onClick={()=>advanceOffer(o.id,1)} className="px-2 py-1 text-xs rounded bg-primary-400 text-white">Next</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {drawerTab === 'chat' && (
                  <div className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`}>
                    <button onClick={()=> window.location.href = `/agents/chat?contact=${sanitizeContact(activeClient.name)}` } className="px-3 py-2 rounded bg-primary-400 text-white text-sm">Open chat</button>
                  </div>
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </AgentShell>
  );
} 
