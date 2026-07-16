'use client';

import React from 'react';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { LogOut, User } from 'lucide-react';

import { NotificationCenter } from '../domain/NotificationCenter';

export function TopNav() {
  const { currentEvent, currentVenue } = useAppStore();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-gray-800 bg-gray-950 px-6">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-400">Current Event</span>
          <span className="text-sm font-bold text-white">{currentEvent}</span>
        </div>
        <div className="h-8 w-px bg-gray-800" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-400">Venue</span>
          <span className="text-sm font-bold text-white">{currentVenue}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900 border border-gray-800">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-200">{user.email}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-400 ml-2 border border-blue-800">
              {user.role}
            </span>
          </div>
        )}
        <NotificationCenter />
        <button
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
