import { cookies } from 'next/headers';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getUserProfile } from '@/lib/profile';
import { ProfileNavigation } from './components/profileNavigation';

async function resolveLocale(): Promise<string> {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get('lumina_language')?.value;
  if (langCookie === 'en' || langCookie === 'ru' || langCookie === 'ka') return langCookie;
  return 'ka';
}

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const locale = await resolveLocale();
  const profile = await getUserProfile({ locale });

  return (
    <ProtectedRoute requiredRoles={['user', 'client', 'investor', 'agent', 'admin']} fallbackRoute="/login">
      <main className="min-h-screen bg-gradient-to-br from-[#f8fbff] via-white to-[#eef4ff] py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900/95">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-8">
          <div className="flex flex-col gap-6 xl:grid xl:grid-cols-[220px_minmax(0,1fr)] xl:gap-10">
            <div className="hidden xl:flex xl:justify-start">
              <ProfileNavigation user={profile.user} />
            </div>
            <div className="space-y-6">{children}</div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}








