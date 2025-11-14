import { cookies } from 'next/headers';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getUserProfile } from '@/lib/profile';
import { MyListingsSection } from '../components/myListingsSection';

async function resolveLocale(): Promise<string> {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get('lumina_language')?.value;
  if (langCookie === 'en' || langCookie === 'ru' || langCookie === 'ka') return langCookie;
  return 'ka';
}

export default async function ListingsPage() {
  const locale = await resolveLocale();
  const profile = await getUserProfile({ locale });
  return (
    <ProtectedRoute requiredRoles={['user', 'client', 'investor', 'agent', 'admin']} fallbackRoute="/login">
      <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_12px_45px_rgba(15,23,42,0.07)] dark:border-slate-800/60 dark:bg-slate-900/75 sm:p-8">
        <MyListingsSection listings={profile.favorites} />
      </section>
    </ProtectedRoute>
  );
}








