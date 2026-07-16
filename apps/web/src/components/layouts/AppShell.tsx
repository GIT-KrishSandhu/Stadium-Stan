'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopNav />
        <main className="flex-1 p-6" style={{ backgroundColor: 'var(--background)' }}>
          {children}
        </main>
        {/* Footer Status Strip - Operational Indicator */}
        <div 
          className="h-7 w-full px-6 flex items-center justify-between text-xs shrink-0"
          style={{
            backgroundColor: 'var(--surface-primary)',
            borderTop: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)'
          }}
        >
          <span>System operational</span>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--status-normal)' }} />
            <span style={{ color: 'var(--status-normal)' }}>All systems nominal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
