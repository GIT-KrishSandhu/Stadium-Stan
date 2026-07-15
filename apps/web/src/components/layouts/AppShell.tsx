'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-gray-950 text-white">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopNav />
        <main className="flex-1 p-6 bg-gray-900">
          {children}
        </main>
        {/* Footer Status Strip Placeholder */}
        <div className="h-6 w-full border-t border-gray-800 bg-gray-950 px-4 flex items-center text-xs text-gray-500 shrink-0">
          System operational.
        </div>
      </div>
    </div>
  );
}
