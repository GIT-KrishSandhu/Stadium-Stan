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
    <header 
      className="flex h-16 w-full items-center justify-between px-6 shrink-0"
      style={{
        backgroundColor: 'var(--surface-primary)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Venue Context */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Current Event
          </span>
          <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {currentEvent}
          </span>
        </div>
        <div 
          className="h-6 w-px"
          style={{ backgroundColor: 'var(--border-subtle)' }}
        />
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Venue
          </span>
          <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {currentVenue}
          </span>
        </div>
      </div>

      {/* Actions & User Menu */}
      <div className="flex items-center gap-3">
        {user && (
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all duration-200"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
            }}
          >
            <User className="h-4 w-4" style={{ color: 'var(--text-tertiary)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              {user.email}
            </span>
            <span 
              className="text-xs px-1.5 py-0.5 rounded font-medium ml-1"
              style={{
                backgroundColor: 'rgba(0, 102, 255, 0.15)',
                color: 'var(--blue-600)',
              }}
            >
              {user.role}
            </span>
          </div>
        )}
        <NotificationCenter />
        <button
          onClick={handleLogout}
          className="p-2 rounded-md transition-all duration-200 hover:scale-105"
          style={{
            color: 'var(--text-tertiary)',
            backgroundColor: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--hover-overlay)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-tertiary)';
          }}
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
