import { format } from 'date-fns';
import type { Locale } from 'date-fns';
import { ka, enUS } from 'date-fns/locale';
import type { MockProperty } from './mockProperties';
import { getMockProperties } from './mockProperties';
import type {
  ProfileActivity,
  ProfileAppointment,
  ProfileAgentSummary,
  ProfileDocument,
  ProfileInquiry,
  ProfileNotificationsPreferences,
  ProfileNotification,
  ProfilePreferences,
  ProfilePropertySummary,
  ProfileSavedSearch,
  ProfileStat,
  ProfileUser,
  UserProfile,
} from '@/types/profile';

const DISTRICT_LABELS: Record<string, string> = {
  vake: 'ვაკე',
  mtatsminda: 'მთაწმინდა',
  saburtalo: 'საბურთალო',
  isani: 'ისანი',
  gldani: 'გლდანი',
};

const dateLocaleMap: Record<string, Locale> = {
  ka,
  en: enUS,
};

const formatDate = (iso: string, locale: string) => {
  const loc = dateLocaleMap[locale] ?? ka;
  return format(new Date(iso), 'PPP • HH:mm', { locale: loc });
};

const MOCK_AGENTS: ProfileAgentSummary[] = [
  {
    id: 'agent-04',
    name: 'სოფო კალანდაძე',
    avatarUrl: '/images/photos/Agents/agent-2.jpg',
    phone: '+995 595 222 333',
    email: 'sopo.kalandadze@luminaestate.ge',
    companyName: 'Lumina Estate',
    rating: 4.8,
  },
  {
    id: 'agent-02',
    name: 'თამარ ლომიძე',
    avatarUrl: '/images/photos/Agents/agent-3.jpg',
    phone: '+995 598 777 888',
    email: 'tamar.lomidze@luminaestate.ge',
    companyName: 'Lumina Estate',
    rating: 4.6,
  },
];

function getMockAgentById(id: string): ProfileAgentSummary | undefined {
  return MOCK_AGENTS.find((agent) => agent.id === id);
}

function autoAssignAgentByDistrict(district?: string): ProfileAgentSummary {
  if (!district) return MOCK_AGENTS[0];
  if (['vake', 'mtatsminda'].includes(district)) return MOCK_AGENTS[0];
  return MOCK_AGENTS[1] ?? MOCK_AGENTS[0];
}

const toProfileProperty = (property: MockProperty): ProfilePropertySummary => {
  const localeName = DISTRICT_LABELS[property.address] ?? property.address;
  return {
    id: `mock-${property.id}`,
    title: `${property.type.charAt(0).toUpperCase()}${property.type.slice(1)} · ${localeName}`,
    subtitle: `Floor ${property.floor ?? 1} · ${property.sqft} მ²`,
    district: property.address,
    city: 'თბილისი',
    addressLine: `საქართველო, ${localeName}`,
    price: property.price,
    currency: 'GEL',
    propertyType: property.type,
    status: property.status,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.sqft,
    floor: property.floor,
    thumbnailUrl: property.image,
    imageGallery: property.images,
    isNew: Boolean(property.isNew),
    tags: property.amenities?.slice(0, 4) ?? [],
    favoriteSince: new Date(Date.now() - property.id * 86400000).toISOString(),
  };
};

const baseUser: ProfileUser = {
  id: 'user-mock-001',
  firstName: 'ანნა',
  lastName: 'ქავთარაძე',
  fullName: 'სოფო ლომიძე',
  email: 'anna.kavtaradze@example.com',
  phone: '+995 599 123 456',
  avatarUrl: '/images/photos/Agents/sarah-wilson.jpg',
  role: 'client',
  isVerified: true,
  joinedAt: new Date(Date.now() - 180 * 86400000).toISOString(),
  lastLoginAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  bio: null,
  companyName: 'Lumina Estate Client',
  companyTitle: 'Premium Member',
  assignedAgent: {
    id: 'agent-04',
    name: 'სოფო კალანდაძე',
    avatarUrl: '/images/photos/Agents/agent-2.jpg',
    phone: '+995 595 222 333',
    email: 'sopo.kalandadze@luminaestate.ge',
    companyName: 'Lumina Estate',
    rating: 4.8,
  },
};

const buildStats = (favoritesCount: number): ProfileStat[] => [
  {
    id: 'favorites',
    label: 'შენახული ქონებები',
    value: favoritesCount,
    description: 'Property wishlist items across all saved searches',
    change: { type: 'up', percentage: 12, label: 'ბოლო 30 დღე' },
    icon: 'Star',
    accent: 'emerald',
  },
  {
    id: 'appointments',
    label: 'დაგეგმილი ვიზიტები',
    value: 3,
    description: 'Tours scheduled with Lumina partner agents',
    change: { type: 'steady', label: 'ამ კვირაში' },
    icon: 'Calendar',
    accent: 'sky',
  },
  {
    id: 'responses',
    label: 'მიმდინარე მოთხოვნები',
    value: 2,
    description: 'Agent follow-ups awaiting your response',
    change: { type: 'down', percentage: 18, label: 'ახლო 7 დღე' },
    icon: 'Chat',
    accent: 'amber',
  },
  {
    id: 'mortgage',
    label: 'იპოთეკის წინასწარი შეფასება',
    value: 'Coming Soon',
    description: 'ფუნქციონალი მალე დაემატება',
    icon: 'TrendUp',
    accent: 'rose',
  },
];

const savedSearches: ProfileSavedSearch[] = [
  {
    id: 'search-01',
    name: 'ვაკე · პრემიუმ ბინები',
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    lastRunAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    totalMatches: 36,
    filters: {
      district: 'vake',
      min_price: 200000,
      property_type: ['apartment', 'penthouse'],
      bedrooms: 3,
    },
    notifyByEmail: true,
    notifyByPush: true,
  },
  {
    id: 'search-02',
    name: 'საბურთალო · ინტელიგენტი სტუდიოები',
    createdAt: new Date(Date.now() - 21 * 86400000).toISOString(),
    totalMatches: 18,
    filters: {
      district: 'saburtalo',
      max_price: 120000,
      property_type: ['studio'],
    },
    notifyByEmail: false,
    notifyByPush: true,
  },
];

const notificationsPreferences: ProfileNotificationsPreferences = {
  priceAlerts: true,
  newMatches: true,
  appointmentReminders: true,
  newsletter: false,
};

const profilePreferences: ProfilePreferences = {
  language: 'ka',
  currency: 'GEL',
  theme: 'light',
  notifications: notificationsPreferences,
};

const buildAppointments = (properties: ProfilePropertySummary[]): ProfileAppointment[] => [
  {
    id: 'appt-01',
    scheduledAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    status: 'confirmed',
    type: 'viewing',
    meetingLocation: 'ვაკე, ჭავჭავაძის 45',
    property: properties[0],
    agent: {
      id: 'agent-01',
      name: 'სოფო კალანდაძე',
      avatarUrl: '/images/photos/agent-1.jpg',
      phone: '+995 595 222 333',
      email: 'sopo.kalandadze@luminaestate.ge',
      companyName: 'Lumina Estate',
      rating: 4.9,
    },
  },
  {
    id: 'appt-02',
    scheduledAt: new Date(Date.now() + 5 * 86400000).toISOString(),
    status: 'scheduled',
    type: 'consultation',
    meetingLocation: 'Lumina HQ · მე-3 სართული',
    property: properties[1],
    agent: {
      id: 'agent-02',
      name: 'გიორგი აბაშიძე',
      avatarUrl: '/images/photos/agent-2.jpg',
      phone: '+995 598 777 888',
      email: 'giorgi.abashidze@luminaestate.ge',
      companyName: 'Lumina Estate',
      rating: 4.7,
    },
  },
  {
    id: 'appt-03',
    scheduledAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    status: 'completed',
    type: 'inspection',
    property: properties[2],
    notes: 'Need follow-up on parking allocation and HOA fees.',
    agent: {
      id: 'agent-03',
      name: 'თამარ ნებიერიძე',
      avatarUrl: '/images/photos/agent-3.jpg',
      phone: '+995 577 111 000',
      email: 'tamar.neb@luminaestate.ge',
      companyName: 'Lumina Estate',
      rating: 4.8,
    },
  },
];

const buildInquiries = (properties: ProfilePropertySummary[]): ProfileInquiry[] => [
  {
    id: 'inq-01',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: 'responded',
    message: 'ინტერესდება აქვს თუ არა ქონებას მიწისქვეშა პარკინგი და ბინის გეგმას მომაწვდით?',
    respondedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    property: properties[3],
    agent: {
      id: 'agent-02',
      name: 'გიორგი აბაშიძე',
      avatarUrl: '/images/photos/agent-2.jpg',
      phone: '+995 598 777 888',
      email: 'giorgi.abashidze@luminaestate.ge',
    },
  },
  {
    id: 'inq-02',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    status: 'in_progress',
    message: 'შესაძლებელია თუ არა ფასზე მოლაპარაკება 5% ფარგლებში?',
    property: properties[4],
    agent: {
      id: 'agent-04',
      name: 'ნინო ქავთარი',
      avatarUrl: '/images/photos/agent-4.jpg',
      phone: '+995 571 223 344',
      email: 'nino.qavtari@luminaestate.ge',
    },
  },
];

const buildNotifications = (locale: string): ProfileNotification[] => [
  {
    id: 'notif-01',
    title: 'ახალი პრემიუმ ბინა ვაკეში',
    message: 'თქვენთვის შერჩეული ბინა ხელმისაწვდომია 280,000 ₾-დან · 3 საძინებელი, ტერასა.',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    isRead: false,
    type: 'new_property',
    actionUrl: '/properties/hero-vake-01',
  },
  {
    id: 'notif-02',
    title: 'ტურის შეხსენება',
    message: 'ხვალ, ' + formatDate(new Date(Date.now() + 2 * 86400000).toISOString(), locale),
    createdAt: new Date(Date.now() - 7 * 3600000).toISOString(),
    isRead: false,
    type: 'appointment',
  },
  {
    id: 'notif-03',
    title: 'ფასის შემცირება 12,000 ₾-ით',
    message: 'საბურთალოს სტუდიო, რომლის დაჯავშნა გსურდათ, ახლა 108,000 ₾ ღირს.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    isRead: true,
    type: 'price_change',
    actionUrl: '/properties/studio-saburtalo-02',
  },
];

const buildDocuments = (): ProfileDocument[] => [
  {
    id: 'doc-01',
    name: 'Viewing Agreement - Vake Terrace',
    category: 'contract',
    status: 'completed',
    updatedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    downloadUrl: '/documents/viewing-agreement-vake.pdf',
  },
  {
    id: 'doc-02',
    name: 'Pre-approval Letter - TBC Bank',
    category: 'mortgage',
    status: 'pending',
    updatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'doc-03',
    name: 'Due Diligence Checklist',
    category: 'legal',
    status: 'expired',
    updatedAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    downloadUrl: '/documents/due-diligence-checklist.pdf',
  },
];

const buildActivity = (properties: ProfilePropertySummary[]): ProfileActivity[] => [
  {
    id: 'activity-01',
    timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
    type: 'favorite_added',
    title: 'დამატებულია ფავორიტებში',
    description: properties[0].title,
    property: properties[0],
    status: 'success',
  },
  {
    id: 'activity-02',
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
    type: 'appointment_scheduled',
    title: 'დაგეგმილი ტური',
    description: properties[1].title,
    property: properties[1],
    status: 'info',
  },
  {
    id: 'activity-03',
    timestamp: new Date(Date.now() - 30 * 3600000).toISOString(),
    type: 'document_uploaded',
    title: 'დოკუმენტის ატვირთვა',
    description: 'Due Diligence Checklist განახლდა',
    status: 'warning',
  },
  {
    id: 'activity-04',
    timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
    type: 'profile_updated',
    title: 'პროფილი განახლდა',
    description: 'დაემატა ახალი საკონტაქტო ნომერი',
    status: 'info',
  },
];

export const getMockUserProfile = async (options?: { locale?: string }): Promise<UserProfile> => {
  const locale = options?.locale ?? 'ka';
  const props = getMockProperties(12).map(toProfileProperty);
  return {
    user: baseUser,
    stats: buildStats(props.length),
    favorites: props.slice(0, 6),
    savedSearches,
    appointments: buildAppointments(props),
    inquiries: buildInquiries(props),
    notifications: buildNotifications(locale),
    preferences: profilePreferences,
    documents: buildDocuments(),
    activity: buildActivity(props),
  };
};


