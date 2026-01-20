import { cookies } from 'next/headers';
import { getUserProfile } from '@/lib/profile';
import ProfileDashboard from './components/profileDashboard';

async function resolveLocale(): Promise<string> {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get('lumina_language')?.value;
  if (langCookie === 'en' || langCookie === 'ru' || langCookie === 'ka') return langCookie;
  return 'ka';
}

export default async function ProfilePage() {
  const locale = await resolveLocale();
  const profile = await getUserProfile({ locale });

  return <ProfileDashboard profile={profile} />;
}
