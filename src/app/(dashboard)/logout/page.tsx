'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      try {
        await logout();
      } finally {
        // Clear any lingering app keys or caches
        if (typeof window !== 'undefined') {
          try { localStorage.removeItem('adminAuth'); } catch {}
          try { localStorage.removeItem('adminUser'); } catch {}
          try { sessionStorage.removeItem('lumina_session'); } catch {}
        }
        // Navigate home, then ensure hard reload
        router.replace('/');
        if (typeof window !== 'undefined') {
          window.location.replace('/');
        }
      }
    };
    run();
  }, [logout, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center text-gray-600">
      გასვლა...
    </div>
  );
}
