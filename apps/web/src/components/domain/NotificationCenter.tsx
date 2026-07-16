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
  low: 'bg-gray-800 text-gray-400',
  normal: 'bg-blue-900/30 text-blue-400 border-blue-900/50',
  high: 'bg-orange-900/30 text-orange-400 border-orange-900/50',
  critical: 'bg-red-900/30 text-red-400 border-red-900/50 animate-pulse'
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
        className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-900 transition-all border border-transparent hover:border-gray-800 focus:outline-none"
        aria-label="Notification Center"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-gray-900 animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 rounded-2xl border border-gray-800 bg-gray-950 p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm">Notifications</h3>
              <span className="text-[10px] bg-gray-900 px-2 py-0.5 rounded-full text-gray-400 font-semibold">{notifications.length} Total</span>
            </div>
            
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead(currentRole)}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="w-8 h-8 text-gray-600 mb-2 opacity-50" />
                <p className="text-gray-500 text-xs">No notifications yet</p>
                <p className="text-[10px] text-gray-600 mt-0.5">Real-time alerts will appear here.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = iconMap[n.type] || Bell;
                return (
                  <div 
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={cn(
                      "flex gap-3 p-3 rounded-xl border transition-all cursor-pointer",
                      n.read ? "bg-transparent border-transparent hover:bg-gray-900/50" : "bg-gray-900/40 border-gray-800/80 hover:bg-gray-900 hover:border-gray-700"
                    )}
                  >
                    {/* Severity / Type Icon */}
                    <div className={cn("p-2 rounded-lg shrink-0 h-9 w-9 flex items-center justify-center border", priorityColorMap[n.priority])}>
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className={cn("text-xs font-bold truncate", n.read ? "text-gray-400" : "text-white")}>{n.title}</h4>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 ml-1.5 mt-1"></span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed break-words">{n.message}</p>
                      <span className="text-[9px] text-gray-500 block mt-1.5 font-mono">
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
            <div className="mt-3 pt-2 border-t border-gray-900 flex justify-end">
              <button 
                onClick={clearAll}
                className="text-[10px] text-red-500/80 hover:text-red-400 flex items-center gap-1 transition-colors"
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
