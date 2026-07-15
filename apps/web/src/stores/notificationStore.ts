import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 'operational' | 'simulation' | 'execution' | 'system' | 'connection';
export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface AppNotification {
  id: string;
  role: 'manager' | 'volunteer' | 'fan';
  type: NotificationType;
  severity: NotificationSeverity;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  deepLink?: string;
  autoDismiss?: boolean;
}

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: (role: 'manager' | 'volunteer' | 'fan') => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      addNotification: (notification) => set((state) => {
        const newNotif: AppNotification = {
          ...notification,
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toISOString(),
          read: false
        };
        // Keep max 50 notifications total
        return {
          notifications: [newNotif, ...state.notifications].slice(0, 50)
        };
      }),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      })),
      markAllAsRead: (role) => set((state) => ({
        notifications: state.notifications.map(n => n.role === role ? { ...n, read: true } : n)
      })),
      clearAll: () => set({ notifications: [] })
    }),
    {
      name: 'stadium-stan-notifications',
    }
  )
);
