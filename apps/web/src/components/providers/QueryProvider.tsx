'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  }));

  useEffect(() => {
    const handleSync = () => {
      console.log("[QueryProvider] Invalidating queries due to external sync event");
      queryClient.invalidateQueries();
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('SYNC_REQUIRED', handleSync as EventListener);
      return () => window.removeEventListener('SYNC_REQUIRED', handleSync as EventListener);
    }
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
