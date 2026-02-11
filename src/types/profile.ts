import type { CurrencyType } from '@prisma/client';

type ProfileRole = 'client' | 'agent' | 'investor' | 'admin';

export interface ProfileUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: ProfileRole;
  isVerified: boolean;
  joinedAt: string;
  lastLoginAt?: string | null;
  bio?: string | null;
  companyName?: string | null;
  companyTitle?: string | null;
  assignedAgent?: ProfileAgentSummary | null;
}

type ProfileTrend = 'up' | 'down' | 'steady';

export interface ProfileStat {
  id: string;
  label: string;
  description?: string;
  value: number | string;
  change?: {
    type: ProfileTrend;
    percentage?: number;
    label?: string;
  };
  icon?: string;
  accent?: 'emerald' | 'amber' | 'sky' | 'rose' | 'slate';
}

export interface ProfilePropertySummary {
  id: string;
  title: string;
  subtitle?: string;
  district?: string;
  city: string;
  addressLine?: string;
  price: number;
  currency: CurrencyType;
  propertyType: string;
  status: 'for-sale' | 'for-rent';
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  floor?: number;
  thumbnailUrl: string;
  imageGallery?: string[];
  isNew?: boolean;
  tags?: string[];
  favoriteSince?: string;
}

export interface ProfileSavedSearch {
  id: string;
  name: string;
  createdAt: string;
  lastRunAt?: string;
  totalMatches?: number;
  filters: Record<string, unknown>;
  notifyByEmail?: boolean;
  notifyByPush?: boolean;
}

export interface ProfileAgentSummary {
  id: string;
  name: string;
  avatarUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  companyName?: string | null;
  rating?: number | null;
}

export interface ProfileAppointment {
  id: string;
  scheduledAt: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  type: 'viewing' | 'consultation' | 'signing' | 'inspection';
  meetingLocation?: string | null;
  notes?: string | null;
  property: ProfilePropertySummary;
  agent?: ProfileAgentSummary | null;
}

export interface ProfileInquiry {
  id: string;
  createdAt: string;
  status: 'new' | 'in_progress' | 'responded' | 'closed';
  message: string;
  respondedAt?: string | null;
  property: ProfilePropertySummary;
  agent?: ProfileAgentSummary | null;
}

export interface ProfileNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: 'new_property' | 'price_change' | 'appointment' | 'review' | 'system';
  actionUrl?: string | null;
}

export interface ProfileDocument {
  id: string;
  name: string;
  category: 'contract' | 'mortgage' | 'legal' | 'other';
  status: 'completed' | 'pending' | 'expired';
  updatedAt: string;
  downloadUrl?: string;
}

export interface ProfileActivity {
  id: string;
  timestamp: string;
  type:
    | 'favorite_added'
    | 'favorite_removed'
    | 'appointment_scheduled'
    | 'appointment_completed'
    | 'inquiry_sent'
    | 'document_uploaded'
    | 'profile_updated'
    | 'system';
  title: string;
  description?: string;
  property?: ProfilePropertySummary;
  status?: 'success' | 'info' | 'warning';
}

export interface ProfileNotificationsPreferences {
  priceAlerts: boolean;
  newMatches: boolean;
  appointmentReminders: boolean;
  newsletter: boolean;
}

export interface ProfilePreferences {
  language: string;
  currency: CurrencyType;
  theme: 'light' | 'dark';
  notifications: ProfileNotificationsPreferences;
}

export interface UserProfile {
  user: ProfileUser;
  stats: ProfileStat[];
  favorites: ProfilePropertySummary[];
  savedSearches: ProfileSavedSearch[];
  appointments: ProfileAppointment[];
  inquiries: ProfileInquiry[];
  notifications: ProfileNotification[];
  preferences: ProfilePreferences;
  documents: ProfileDocument[];
  activity: ProfileActivity[];
}

