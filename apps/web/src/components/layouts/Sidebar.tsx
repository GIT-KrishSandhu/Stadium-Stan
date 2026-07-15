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
  { name: 'Simulation', href: '/manager/simulation', icon: BrainCircuit, active: true },
  { name: 'AI Actions', href: '/manager/actions', icon: Activity, active: true },
  { name: 'Incidents', href: '/manager/incidents', icon: ShieldAlert, active: true },
  { name: 'Audit History', href: '/manager/history', icon: History, active: true },
  { name: 'Settings', href: '/manager/settings', icon: Settings, active: true },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-800 bg-gray-950 px-4 py-6">
      <Link href="/" className="flex items-center gap-2 px-2 mb-8 hover:opacity-85 transition-opacity">
        <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center font-bold text-white">S</div>
        <span className="text-xl font-bold text-white">Stadium Stan</span>
      </Link>
      <nav className="flex flex-1 flex-col gap-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.active ? item.href : '#'}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              item.active
                ? pathname === item.href
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
                : "text-gray-600 cursor-not-allowed opacity-50"
            )}
            onClick={(e) => {
              if (!item.active) e.preventDefault();
            }}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
            {!item.active && <span className="ml-auto text-xs bg-gray-800 px-2 py-0.5 rounded-full">Soon</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
}
