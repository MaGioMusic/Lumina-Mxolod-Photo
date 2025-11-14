import { cookies } from 'next/headers';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getUserProfile } from '@/lib/profile';
import { DocumentsSection } from '../components/documentsSection';

async function resolveLocale(): Promise<string> {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get('lumina_language')?.value;
  if (langCookie === 'en' || langCookie === 'ru' || langCookie === 'ka') return langCookie;
  return 'ka';
}

export default async function DocumentsPage() {
  const locale = await resolveLocale();
  const profile = await getUserProfile({ locale });
  return (
    <ProtectedRoute requiredRoles={['user', 'client', 'investor', 'agent', 'admin']} fallbackRoute="/login">
      <DocumentsSection documents={profile.documents} />
    </ProtectedRoute>
  );
}








