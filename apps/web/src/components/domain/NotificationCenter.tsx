'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, ShieldAlert, Activity, Server, Zap, CheckCircle2 } from 'lucide-react';
import { useNotificationStore, AppNotification } from '../../stores/notificationStore';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'next/navigation';
import { cn } from '../../lib/utils';

const iconMap = {
  operational: Activity,
  simulation: Zap,
  execution: CheckCircle2,
  system: Server,
  connection: ShieldAlert
};

const priorityColorMap = {
  low: { bg: 'rgba(109, 133, 23, 0.1)', text: 'var(--status-normal)', border: 'rgba(109, 133, 23, 0.2)' },
  normal: { bg: 'rgba(209, 184, 52, 0.1)', text: 'var(--mustard)', border: 'rgba(209, 184, 52, 0.2)' },
  high: { bg: 'rgba(198, 126, 27, 0.1)', text: 'var(--status-critical)', border: 'rgba(198, 126, 27, 0.2)' },
  critical: { bg: 'rgba(220, 38, 38, 0.1)', text: 'var(--status-error)', border: 'rgba(220, 38, 38, 0.3)' }
};

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const currentRoleFromPath = pathname.includes('/manager') ? 'manager' : pathname.includes('/volunteer') ? 'volunteer' : pathname.includes('/fan') ? 'fan' : null;
  
  const userRole = useAuthStore(state => state.user?.role);
  const currentRole = currentRoleFromPath || userRole || 'fan';
  const allNotifications = useNotificationStore(state => state.notifications);
  const notifications = React.useMemo(() => 
    allNotifications.filter(n => n.role === currentRole),
    [allNotifications, currentRole]
  );
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const markAsRead = useNotificationStore(state => state.markAsRead);
  const markAllAsRead = useNotificationStore(state => state.markAllAsRead);
  const clearAll = useNotificationStore(state => state.clearAll);

  // Close dropdown on outside click
  useEffect(() => {
    setMounted(true);
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (n: AppNotification) => {
    markAsRead(n.id);
    setIsOpen(false);
    if (n.deepLink) {
      router.push(n.deepLink);
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-md transition-all duration-200 focus:outline-none"
        style={{
          color: 'var(--text-tertiary)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--hover-overlay)';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--text-tertiary)';
        }}
        aria-label="Notification Center"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span 
            className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{
              backgroundColor: 'var(--red-incident)',
              boxShadow: '0 0 0 2px var(--surface-primary)',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-96 rounded-lg p-4 z-50 border animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between pb-3 mb-3 border-b"
            style={{ borderBottomColor: 'var(--border-subtle)' }}
          >
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>Notifications</h3>
              <span 
                className="text-[10px] px-2 py-0.5 rounded font-semibold"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  color: 'var(--text-muted)',
                }}
              >
                {notifications.length} Total
              </span>
            </div>
            
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead(currentRole)}
                className="text-xs font-semibold flex items-center gap-1 transition-colors duration-200"
                style={{ color: 'var(--mustard)' }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="w-8 h-8 mb-2 opacity-40" style={{ color: 'var(--text-muted)' }} />
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>No notifications yet</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Real-time alerts will appear here.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = iconMap[n.type] || Bell;
                const colorMap = priorityColorMap[n.priority];
                return (
                  <div 
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className="flex gap-3 p-3 rounded-md border transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: n.read ? 'transparent' : 'var(--surface-primary)',
                      borderColor: n.read ? 'transparent' : 'var(--border)',
                    }}
                    onMouseEnter={(e) => {
                      if (!n.read) {
                        e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
                        e.currentTarget.style.borderColor = 'var(--border)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!n.read) {
                        e.currentTarget.style.backgroundColor = 'var(--surface-primary)';
                        e.currentTarget.style.borderColor = 'var(--border)';
                      }
                    }}
                  >
                    {/* Severity / Type Icon */}
                    <div 
                      className="p-2 rounded-md shrink-0 h-9 w-9 flex items-center justify-center border"
                      style={{
                        backgroundColor: colorMap.bg,
                        borderColor: colorMap.border,
                        color: colorMap.text,
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-semibold truncate" style={{ color: n.read ? 'var(--text-tertiary)' : 'var(--foreground)' }}>
                          {n.title}
                        </h4>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full shrink-0 ml-1.5 mt-1" style={{ backgroundColor: 'var(--blue-primary)' }} />
                        )}
                      </div>
                      <p className="text-[11px] mt-0.5 leading-relaxed break-words" style={{ color: 'var(--text-tertiary)' }}>
                        {n.message}
                      </p>
                      <span className="text-[9px] block mt-1.5 font-mono" style={{ color: 'var(--text-muted)' }}>
                        {new Date(n.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {/* Footer */}
          {notifications.length > 0 && (
            <div 
              className="mt-3 pt-2 border-t flex justify-end"
              style={{ borderTopColor: 'var(--border-subtle)' }}
            >
              <button 
                onClick={clearAll}
                className="text-[10px] flex items-center gap-1 transition-colors duration-200"
                style={{ color: 'var(--red-incident)' }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                <Trash2 className="w-3 h-3" /> Clear history
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
