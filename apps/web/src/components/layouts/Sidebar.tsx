'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Network, BrainCircuit, Activity, FileText, Settings, ShieldAlert, History } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navigation = [
  { name: 'Dashboard', href: '/manager', icon: LayoutDashboard, active: true },
  { name: 'Digital Twin', href: '/manager/twin', icon: Network, active: true },
  { name: 'AI Actions', href: '/manager/actions', icon: Activity, active: true },
  { name: 'Incidents', href: '/manager/incidents', icon: ShieldAlert, active: true },
  { name: 'Audit History', href: '/manager/history', icon: History, active: true },
  { name: 'Settings', href: '/manager/settings', icon: Settings, active: true },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div 
      className="flex h-full w-64 flex-col px-3 py-6 shrink-0"
      style={{
        backgroundColor: 'var(--surface-primary)',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      {/* Logo */}
      <Link 
        href="/" 
        className="flex items-center gap-2.5 px-2 mb-8 rounded-md transition-all duration-200 hover:opacity-80"
        style={{ 
          padding: '0.75rem 0.5rem'
        }}
      >
        <div 
          className="h-8 w-8 rounded-md flex items-center justify-center font-bold text-sm flex-shrink-0"
          style={{ 
            backgroundColor: 'var(--blue-primary)',
            color: 'var(--white)'
          }}
        >
          S
        </div>
        <span 
          className="text-base font-semibold truncate"
          style={{ color: 'var(--foreground)' }}
        >
          Stadium Stan
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.active ? item.href : '#'}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                item.active
                  ? isActive
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                  : "text-gray-500 cursor-not-allowed opacity-50"
              )}
              style={
                item.active && isActive
                  ? {
                      backgroundColor: 'var(--surface-secondary)',
                      color: 'var(--foreground)',
                      borderLeft: '3px solid var(--blue-primary)',
                      paddingLeft: 'calc(0.75rem - 3px)',
                    }
                  : item.active
                  ? {
                      color: 'var(--text-tertiary)',
                    }
                  : {}
              }
              onClick={(e) => {
                if (!item.active) e.preventDefault();
              }}
            >
              <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
              <span className="flex-1">{item.name}</span>
              {!item.active && (
                <span 
                  className="ml-auto text-xs px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: 'var(--graphite-700)',
                    color: 'var(--text-muted)',
                    fontSize: '0.65rem',
                    fontWeight: 500
                  }}
                >
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
