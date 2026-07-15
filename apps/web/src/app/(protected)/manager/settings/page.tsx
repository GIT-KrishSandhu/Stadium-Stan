'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Settings2, Bell, Shield, Network, Zap, Sun, Moon, 
  Languages, Type, RefreshCw, Radio, HardDrive, CheckCircle2, User as UserIcon
} from 'lucide-react';
import { api } from '../../../../services/api';
import { useAuthStore } from '../../../../stores/authStore';
import { useWebSocketStore } from '../../../../stores/wsStore';
import { useNotificationStore } from '../../../../stores/notificationStore';
import { cn } from '../../../../lib/utils';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isConnected = useWebSocketStore(state => state.isConnected);
  const reconnectAttempts = useWebSocketStore(state => state.reconnectAttempts);
  const lastMessageTime = useWebSocketStore(state => state.lastMessageTime);
  const addNotification = useNotificationStore(state => state.addNotification);

  // States
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [pushPref, setPushPref] = useState(true);
  const [smsPref, setSmsPref] = useState(true);
  const [emailPref, setEmailPref] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es' | 'fr'>('en');

  // Load from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' || 'dark';
    const savedFontSize = localStorage.getItem('font-size') as 'normal' | 'large' || 'normal';
    const savedContrast = localStorage.getItem('high-contrast') === 'true';
    const savedLang = localStorage.getItem('language') as 'en' | 'es' | 'fr' || 'en';

    setTheme(savedTheme);
    setFontSize(savedFontSize);
    setHighContrast(savedContrast);
    setLanguage(savedLang);

    // Apply font size
    document.body.style.fontSize = savedFontSize === 'large' ? '18px' : '16px';
  }, []);

  // Update theme helper
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
    
    addNotification({
      role: 'manager',
      type: 'system',
      severity: 'info',
      priority: 'low',
      title: 'Theme Changed',
      message: `Theme set to ${nextTheme} mode.`
    });
  };

  // Update font size helper
  const handleFontSizeChange = (size: 'normal' | 'large') => {
    setFontSize(size);
    localStorage.setItem('font-size', size);
    document.body.style.fontSize = size === 'large' ? '18px' : '16px';
  };

  // Diagnostics check
  const { data: healthData, isLoading: isCheckingHealth, refetch: checkHealth } = useQuery({
    queryKey: ['diagnostics-health'],
    queryFn: async () => {
      const res = await api.get('/health');
      return res.data;
    },
    refetchOnWindowFocus: false
  });

  // DB Reset mutation
  const resetDbMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/venues/reset');
      return res.data;
    },
    onSuccess: () => {
      // Invalidate all react query caches
      queryClient.invalidateQueries();
      
      addNotification({
        role: 'manager',
        type: 'system',
        severity: 'success',
        priority: 'high',
        title: 'Demo Environment Reset',
        message: 'The relational database has been re-seeded and live telemetry nodes have been synchronized.'
      });
      alert('Database reset successful. Ready for E2E walk-through!');
    },
    onError: (err: any) => {
      alert(`Reset failed: ${err.message}`);
    }
  });

  return (
    <div className="flex flex-col h-full min-h-0 gap-6 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings2 className="w-6 h-6 text-blue-500" /> Platform Settings & Diagnostics
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* User Profile */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 flex flex-col gap-5 shadow-lg">
          <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
            <UserIcon className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Active Profile</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">EMAIL ADDRESS</span>
              <span className="text-sm font-semibold text-gray-200">{user?.email || 'manager@stadiumstan.demo'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">ASSIGNED ROLE</span>
              <span className="text-xs font-bold bg-blue-900/30 text-blue-400 border border-blue-900/50 px-2 py-0.5 rounded uppercase w-max">
                {user?.role || 'manager'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">SESSION TOKEN</span>
              <span className="text-[10px] font-mono text-gray-400 break-all select-all">
                {useAuthStore.getState().token || 'fake-jwt-token-for-manager'}
              </span>
            </div>
          </div>
        </div>

        {/* Persona Preferences */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 flex flex-col gap-5 shadow-lg">
          <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
            <Bell className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">Notification Scopes</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Push Live Notifications</span>
              <button 
                onClick={() => setPushPref(!pushPref)}
                className={cn(
                  "w-10 h-5 rounded-full flex items-center px-1 transition-colors duration-200 focus:outline-none",
                  pushPref ? "bg-blue-600" : "bg-gray-800"
                )}
              >
                <div className={cn("w-4 h-4 bg-white rounded-full transition-transform duration-200", pushPref && "translate-x-5")}></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">SMS Critical Dispatch Alerts</span>
              <button 
                onClick={() => setSmsPref(!smsPref)}
                className={cn(
                  "w-10 h-5 rounded-full flex items-center px-1 transition-colors duration-200 focus:outline-none",
                  smsPref ? "bg-blue-600" : "bg-gray-800"
                )}
              >
                <div className={cn("w-4 h-4 bg-white rounded-full transition-transform duration-200", smsPref && "translate-x-5")}></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Email System Summaries</span>
              <button 
                onClick={() => setEmailPref(!emailPref)}
                className={cn(
                  "w-10 h-5 rounded-full flex items-center px-1 transition-colors duration-200 focus:outline-none",
                  emailPref ? "bg-blue-600" : "bg-gray-800"
                )}
              >
                <div className={cn("w-4 h-4 bg-white rounded-full transition-transform duration-200", emailPref && "translate-x-5")}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Look and Feel */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 flex flex-col gap-5 shadow-lg">
          <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
            <Sun className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-bold text-white">Interface Customization</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Color Palette Theme</span>
              <button 
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-3 py-1 bg-gray-900 border border-gray-700 hover:border-gray-500 rounded text-xs text-white transition-all font-medium"
              >
                {theme === 'dark' ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-blue-400" /> Dark Mode
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-yellow-500" /> Light Mode
                  </>
                )}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300 flex items-center gap-1.5"><Type className="w-4 h-4 text-gray-400" /> Accessibility Sizing</span>
              <select 
                value={fontSize}
                onChange={(e) => handleFontSizeChange(e.target.value as any)}
                className="bg-gray-900 border border-gray-700 rounded px-2.5 py-1 text-xs text-white outline-none focus:border-blue-500"
              >
                <option value="normal">Normal Text</option>
                <option value="large">Large Text</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Primary Language</span>
              <div className="flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-gray-500" />
                <select 
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value as any);
                    localStorage.setItem('language', e.target.value);
                  }}
                  className="bg-gray-900 border border-gray-700 rounded px-2.5 py-1 text-xs text-white outline-none focus:border-blue-500"
                >
                  <option value="en">English (US)</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Diagnostics */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 flex flex-col gap-5 md:col-span-2 shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div className="flex items-center gap-3">
              <Radio className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Diagnostics & Telemetry Health</h2>
            </div>
            
            <button 
              onClick={() => checkHealth()} 
              disabled={isCheckingHealth}
              className="p-1.5 hover:bg-gray-900 text-gray-400 hover:text-white rounded border border-gray-800 hover:border-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn("w-4 h-4", isCheckingHealth && "animate-spin")} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-900/40 border border-gray-800/80 rounded-xl flex flex-col gap-2">
              <span className="text-xs text-gray-400 font-bold tracking-wide uppercase">FASTAPI GATEWAY</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  "w-2.5 h-2.5 rounded-full",
                  healthData?.status === 'ok' ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                )} />
                <span className="text-sm font-semibold text-white">
                  {healthData?.status === 'ok' ? 'Online (CORS standard)' : 'Offline / Degraded'}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 block">BASE URL: http://localhost:8000/api/v1</span>
            </div>

            <div className="p-3 bg-gray-900/40 border border-gray-800/80 rounded-xl flex flex-col gap-2">
              <span className="text-xs text-gray-400 font-bold tracking-wide uppercase">POSTGRESQL DATABASE</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  "w-2.5 h-2.5 rounded-full",
                  healthData?.database === 'connected' ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                )} />
                <span className="text-sm font-semibold text-white">
                  {healthData?.database === 'connected' ? 'Connected (Port 5433)' : 'Operational Failure'}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 block">DB NAME: stadium_stan</span>
            </div>

            <div className="p-3 bg-gray-900/40 border border-gray-800/80 rounded-xl flex flex-col gap-2">
              <span className="text-xs text-gray-400 font-bold tracking-wide uppercase">WEBSOCKET PIPELINE</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  "w-2.5 h-2.5 rounded-full",
                  isConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                )} />
                <span className="text-sm font-semibold text-white">
                  {isConnected ? 'Connected' : `Reconnecting (Delay: ${reconnectAttempts * 2}s)`}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 block">
                Last Message: {lastMessageTime ? new Date(lastMessageTime).toLocaleTimeString() : 'No messages yet'}
              </span>
            </div>

            <div className="p-3 bg-gray-900/40 border border-gray-800/80 rounded-xl flex flex-col gap-2">
              <span className="text-xs text-gray-400 font-bold tracking-wide uppercase">LANGGRAPH AGENTS</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-semibold text-white">Stateless (Active)</span>
              </div>
              <span className="text-[10px] text-gray-500 block">WORKFLOWS: crowd, incident, routing</span>
            </div>
          </div>
        </div>

        {/* Demo Operations Reset */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center gap-3 border-b border-gray-800 pb-4 mb-4">
              <HardDrive className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-bold text-white">Demo Control</h2>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Resets the entire relational database state. All simulated incidents, volunteer assignments, response actions, and execution logs will be purged, and the canonical MetLife Stadium topology will be freshly re-seeded.
            </p>
          </div>
          
          <button 
            onClick={() => resetDbMutation.mutate()}
            disabled={resetDbMutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-900/50 hover:border-transparent rounded-xl font-bold text-sm transition-all shadow-lg"
          >
            {resetDbMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Resetting...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" /> Reset Demo Database
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
