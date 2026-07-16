"use client";
import React, { useEffect } from 'react';
import { X, Info, CheckCircle, AlertTriangle, Activity, Server, Zap } from 'lucide-react';
import { useNotificationStore, AppNotification } from '../../stores/notificationStore';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../lib/utils';

const iconMap = {
  operational: Activity,
  simulation: Zap,
  execution: CheckCircle,
  system: Server,
  connection: AlertTriangle
};

const colorMap = {
  info: 'border-blue-500/50 bg-blue-950/40 text-blue-400',
  success: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-400',
  warning: 'border-orange-500/50 bg-orange-950/40 text-orange-400',
  error: 'border-red-500/50 bg-red-950/40 text-red-400'
};

function NotificationToast({ notification }: { notification: AppNotification }) {
  const markAsRead = useNotificationStore(state => state.markAsRead);
  const Icon = iconMap[notification.type] || Info;

  useEffect(() => {
    if (notification.autoDismiss !== false && !notification.read) {
      const timer = setTimeout(() => {
        markAsRead(notification.id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.read, notification.autoDismiss, markAsRead]);

  return (
    <div 
      role="alert"
      className={cn(
        "flex flex-col gap-2 w-80 p-4 border rounded-xl backdrop-blur-xl shadow-2xl pointer-events-auto animate-in slide-in-from-right-8 fade-in duration-300",
        colorMap[notification.severity]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 font-bold tracking-wide uppercase text-xs">
          <Icon className="w-4 h-4" />
          <span>{notification.type}</span>
        </div>
        <button 
          onClick={() => markAsRead(notification.id)}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div>
        <h4 className="text-sm font-semibold text-white">{notification.title}</h4>
        <p className="text-xs mt-0.5 opacity-90">{notification.message}</p>
      </div>

      <div className="text-[10px] uppercase tracking-widest font-mono opacity-50 mt-1">
        {new Date(notification.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}

export function NotificationSystem() {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const currentRoleFromPath = pathname.includes('/manager') ? 'manager' : pathname.includes('/volunteer') ? 'volunteer' : pathname.includes('/fan') ? 'fan' : null;

  const userRole = useAuthStore(state => state.user?.role);
  const currentRole = currentRoleFromPath || userRole || 'fan';
  const allNotifications = useNotificationStore(state => state.notifications);
  const notifications = React.useMemo(() => 
    allNotifications.filter(n => n.role === currentRole && !n.read),
    [allNotifications, currentRole]
  );

  if (!mounted) return null;
  if (notifications.length === 0) return null;

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
    >
      {notifications.map(n => (
        <NotificationToast key={n.id} notification={n} />
      ))}
    </div>
  );
}
