import { cache } from 'react';
import type { UserProfile } from '@/types/profile';
import { getMockUserProfile } from './mockProfile';

const PROFILE_API_URL = process.env.NEXT_PUBLIC_PROFILE_API_URL;

const fetchProfileFromApi = async (locale: string): Promise<UserProfile | null> => {
  if (!PROFILE_API_URL) return null;
  try {
    const url = new URL(PROFILE_API_URL, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
    url.searchParams.set('locale', locale);
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      console.warn('[profile] API returned non-OK status', res.status);
      return null;
    }
    const data = (await res.json()) as UserProfile;
    return data;
  } catch (error) {
    console.warn('[profile] Failed to fetch profile from API, falling back to mock', error);
    return null;
  }
};

interface GetUserProfileOptions {
  locale?: string;
  forceMock?: boolean;
}

export const getUserProfile = cache(async (options?: GetUserProfileOptions): Promise<UserProfile> => {
  const locale = options?.locale ?? 'ka';
  if (!options?.forceMock) {
    const viaApi = await fetchProfileFromApi(locale);
    if (viaApi) return viaApi;
  }
  return getMockUserProfile({ locale });
});

const getUserProfileClient = async (options?: GetUserProfileOptions): Promise<UserProfile> => {
  const locale = options?.locale ?? 'ka';
  if (!options?.forceMock && PROFILE_API_URL) {
    try {
      const res = await fetch(`${PROFILE_API_URL}?locale=${locale}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      if (res.ok) {
        return (await res.json()) as UserProfile;
      }
      console.warn('[profile] Client fetch returned', res.status);
    } catch (error) {
      console.warn('[profile] Client fetch failed, using mock', error);
    }
  }
  return getMockUserProfile({ locale });
};


