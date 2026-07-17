'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Bell, User, LogOut } from 'lucide-react';
import { NotificationSystem } from '../../../components/domain/NotificationSystem';
import { NotificationCenter } from '../../../components/domain/NotificationCenter';

import { useAuthStore } from '../../../stores/authStore';

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('stadium_stan_volunteer');
    localStorage.removeItem('volunteer_id');
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  useEffect(() => {
    // Check if volunteer is authenticated
    const authStatus = localStorage.getItem('stadium_stan_volunteer');
    const hasStoreAuth = token && user?.role === 'volunteer';

    if (authStatus !== 'authenticated' && !hasStoreAuth) {
      router.push('/volunteer-login');
    } else {
      setIsAuth(true);
    }
  }, [router, token, user]);

  if (!isAuth) return <div className="h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-950 text-white">
      {/* Volunteer Mobile-Friendly Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
        <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
          <div className="h-8 w-8 rounded bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">
            V
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white leading-none">Stadium Stan</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Volunteer Ops</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <NotificationCenter />
          <div className="h-8 w-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-400" />
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors border border-transparent hover:border-gray-750"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 bg-black p-4 md:p-6 pb-20">
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </main>

      <NotificationSystem />
    </div>
  );
}