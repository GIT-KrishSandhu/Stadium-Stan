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
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
          <Settings2 className="w-6 h-6" style={{ color: 'var(--blue-primary)' }} /> Platform Settings & Diagnostics
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* User Profile */}
        <div 
          className="rounded-lg p-6 flex flex-col gap-5 border"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
          }}
        >
          <div 
            className="flex items-center gap-3 border-b pb-4"
            style={{
              borderBottomColor: 'var(--border-subtle)',
            }}
          >
            <UserIcon className="w-5 h-5" style={{ color: 'var(--blue-primary)' }} />
            <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Active Profile</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>EMAIL ADDRESS</span>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{user?.email || 'manager@stadiumstan.demo'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>ASSIGNED ROLE</span>
              <span 
                className="text-xs font-bold px-2 py-0.5 rounded uppercase w-max border"
                style={{
                  backgroundColor: 'rgba(0, 102, 255, 0.1)',
                  color: 'var(--blue-primary)',
                  borderColor: 'rgba(0, 102, 255, 0.2)',
                }}
              >
                {user?.role || 'manager'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>SESSION TOKEN</span>
              <span className="text-[10px] font-mono break-all select-all" style={{ color: 'var(--text-tertiary)' }}>
                {useAuthStore.getState().token || 'fake-jwt-token-for-manager'}
              </span>
            </div>
          </div>
        </div>

        {/* Persona Preferences */}
        <div 
          className="rounded-lg p-6 flex flex-col gap-5 border"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
          }}
        >
          <div 
            className="flex items-center gap-3 border-b pb-4"
            style={{
              borderBottomColor: 'var(--border-subtle)',
            }}
          >
            <Bell className="w-5 h-5" style={{ color: 'var(--purple-accent)' }} />
            <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Notification Scopes</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Push Live Notifications</span>
              <button 
                onClick={() => setPushPref(!pushPref)}
                className="w-10 h-5 rounded-full flex items-center px-1 transition-colors duration-200 focus:outline-none"
                style={{
                  backgroundColor: pushPref ? 'var(--blue-primary)' : 'var(--surface-tertiary)',
                }}
              >
                <div 
                  className="w-4 h-4 bg-white rounded-full transition-transform duration-200"
                  style={{
                    transform: pushPref ? 'translateX(1.25rem)' : 'translateX(0)',
                  }}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>SMS Critical Dispatch Alerts</span>
              <button 
                onClick={() => setSmsPref(!smsPref)}
                className="w-10 h-5 rounded-full flex items-center px-1 transition-colors duration-200 focus:outline-none"
                style={{
                  backgroundColor: smsPref ? 'var(--blue-primary)' : 'var(--surface-tertiary)',
                }}
              >
                <div 
                  className="w-4 h-4 bg-white rounded-full transition-transform duration-200"
                  style={{
                    transform: smsPref ? 'translateX(1.25rem)' : 'translateX(0)',
                  }}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Email System Summaries</span>
              <button 
                onClick={() => setEmailPref(!emailPref)}
                className="w-10 h-5 rounded-full flex items-center px-1 transition-colors duration-200 focus:outline-none"
                style={{
                  backgroundColor: emailPref ? 'var(--blue-primary)' : 'var(--surface-tertiary)',
                }}
              >
                <div 
                  className="w-4 h-4 bg-white rounded-full transition-transform duration-200"
                  style={{
                    transform: emailPref ? 'translateX(1.25rem)' : 'translateX(0)',
                  }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Look and Feel */}
        <div 
          className="rounded-lg p-6 flex flex-col gap-5 border"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
          }}
        >
          <div 
            className="flex items-center gap-3 border-b pb-4"
            style={{
              borderBottomColor: 'var(--border-subtle)',
            }}
          >
            <Sun className="w-5 h-5" style={{ color: 'var(--amber-warning)' }} />
            <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Interface Customization</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Color Palette Theme</span>
              <button 
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium border transition-all"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                }}
              >
                {theme === 'dark' ? (
                  <>
                    <Moon className="w-3.5 h-3.5" style={{ color: 'var(--blue-primary)' }} /> Dark Mode
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5" style={{ color: 'var(--amber-warning)' }} /> Light Mode
                  </>
                )}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                <Type className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /> Accessibility Sizing
              </span>
              <select 
                value={fontSize}
                onChange={(e) => handleFontSizeChange(e.target.value as any)}
                className="rounded px-2.5 py-1 text-xs outline-none border transition-colors"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                }}
              >
                <option value="normal">Normal Text</option>
                <option value="large">Large Text</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Primary Language</span>
              <div className="flex items-center gap-1.5">
                <Languages className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <select 
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value as any);
                    localStorage.setItem('language', e.target.value);
                  }}
                  className="rounded px-2.5 py-1 text-xs outline-none border transition-colors"
                  style={{
                    backgroundColor: 'var(--surface-primary)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
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
        <div 
          className="rounded-lg p-6 flex flex-col gap-5 md:col-span-2 border"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
          }}
        >
          <div 
            className="flex items-center justify-between border-b pb-4"
            style={{
              borderBottomColor: 'var(--border-subtle)',
            }}
          >
            <div className="flex items-center gap-3">
              <Radio className="w-5 h-5" style={{ color: 'var(--green-success)' }} />
              <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Diagnostics & Telemetry Health</h2>
            </div>
            
            <button 
              onClick={() => checkHealth()} 
              disabled={isCheckingHealth}
              className="p-1.5 rounded border transition-all disabled:opacity-50"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text-muted)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-primary)';
                e.currentTarget.style.color = 'var(--foreground)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <RefreshCw className={cn("w-4 h-4", isCheckingHealth && "animate-spin")} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              className="p-3 border rounded-lg flex flex-col gap-2"
              style={{
                backgroundColor: 'var(--surface-primary)',
                borderColor: 'var(--border)',
              }}
            >
              <span className="text-xs font-bold tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>FASTAPI GATEWAY</span>
              <div className="flex items-center gap-2 mt-1">
                <span 
                  className="w-2.5 h-2.5 rounded-full animate-pulse"
                  style={{
                    backgroundColor: healthData?.status === 'ok' ? 'var(--green-success)' : 'var(--red-incident)',
                  }}
                />
                <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  {healthData?.status === 'ok' ? 'Online (CORS standard)' : 'Offline / Degraded'}
                </span>
              </div>
              <span className="text-[10px] block" style={{ color: 'var(--text-tertiary)' }}>BASE URL: http://localhost:8000/api/v1</span>
            </div>

            <div 
              className="p-3 border rounded-lg flex flex-col gap-2"
              style={{
                backgroundColor: 'var(--surface-primary)',
                borderColor: 'var(--border)',
              }}
            >
              <span className="text-xs font-bold tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>POSTGRESQL DATABASE</span>
              <div className="flex items-center gap-2 mt-1">
                <span 
                  className="w-2.5 h-2.5 rounded-full animate-pulse"
                  style={{
                    backgroundColor: healthData?.database === 'connected' ? 'var(--green-success)' : 'var(--red-incident)',
                  }}
                />
                <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  {healthData?.database === 'connected' ? 'Connected (Port 5433)' : 'Operational Failure'}
                </span>
              </div>
              <span className="text-[10px] block" style={{ color: 'var(--text-tertiary)' }}>DB NAME: stadium_stan</span>
            </div>

            <div 
              className="p-3 border rounded-lg flex flex-col gap-2"
              style={{
                backgroundColor: 'var(--surface-primary)',
                borderColor: 'var(--border)',
              }}
            >
              <span className="text-xs font-bold tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>WEBSOCKET PIPELINE</span>
              <div className="flex items-center gap-2 mt-1">
                <span 
                  className="w-2.5 h-2.5 rounded-full animate-pulse"
                  style={{
                    backgroundColor: isConnected ? 'var(--green-success)' : 'var(--red-incident)',
                  }}
                />
                <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  {isConnected ? 'Connected' : `Reconnecting (Delay: ${reconnectAttempts * 2}s)`}
                </span>
              </div>
              <span className="text-[10px] block" style={{ color: 'var(--text-tertiary)' }}>
                Last Message: {lastMessageTime ? new Date(lastMessageTime).toLocaleTimeString() : 'No messages yet'}
              </span>
            </div>

            <div 
              className="p-3 border rounded-lg flex flex-col gap-2"
              style={{
                backgroundColor: 'var(--surface-primary)',
                borderColor: 'var(--border)',
              }}
            >
              <span className="text-xs font-bold tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>LANGGRAPH AGENTS</span>
              <div className="flex items-center gap-2 mt-1">
                <span 
                  className="w-2.5 h-2.5 rounded-full animate-pulse"
                  style={{ backgroundColor: 'var(--green-success)' }}
                />
                <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Stateless (Active)</span>
              </div>
              <span className="text-[10px] block" style={{ color: 'var(--text-tertiary)' }}>WORKFLOWS: crowd, incident, routing</span>
            </div>
          </div>
        </div>

        {/* Demo Operations Reset */}
        <div 
          className="rounded-lg p-6 flex flex-col justify-between border"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
          }}
        >
          <div>
            <div 
              className="flex items-center gap-3 border-b pb-4 mb-4"
              style={{
                borderBottomColor: 'var(--border-subtle)',
              }}
            >
              <HardDrive className="w-5 h-5" style={{ color: 'var(--red-incident)' }} />
              <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Demo Control</h2>
            </div>
            <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-tertiary)' }}>
              Resets the entire relational database state. All simulated incidents, volunteer assignments, response actions, and execution logs will be purged, and the canonical MetLife Stadium topology will be freshly re-seeded.
            </p>
          </div>
          
          <button 
            onClick={() => resetDbMutation.mutate()}
            disabled={resetDbMutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-3 border rounded-lg font-bold text-sm transition-all"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderColor: 'rgba(239, 68, 68, 0.2)',
              color: 'var(--red-incident)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--red-incident)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.color = 'var(--red-incident)';
            }}
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
