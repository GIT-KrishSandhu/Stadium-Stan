'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/authStore';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!token) {
      router.replace('/login');
    }
  }, [token, router]);

  if (!isMounted || !token) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-800 border-t-blue-600"></div>
          <span className="text-sm font-medium text-gray-400">Authenticating...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
