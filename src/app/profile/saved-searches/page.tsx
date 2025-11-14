import { cookies } from 'next/headers';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getUserProfile } from '@/lib/profile';
import { SavedSearchesSection } from '../components/savedSearchesSection';

async function resolveLocale(): Promise<string> {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get('lumina_language')?.value;
  if (langCookie === 'en' || langCookie === 'ru' || langCookie === 'ka') return langCookie;
  return 'ka';
}

export default async function SavedSearchesPage() {
  const locale = await resolveLocale();
  const profile = await getUserProfile({ locale });
  return (
    <ProtectedRoute requiredRoles={['user', 'client', 'investor', 'agent', 'admin']} fallbackRoute="/login">
      <SavedSearchesSection savedSearches={profile.savedSearches} />
    </ProtectedRoute>
  );
}








