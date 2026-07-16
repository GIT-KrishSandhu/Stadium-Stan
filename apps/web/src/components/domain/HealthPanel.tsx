'use client';

import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { healthApi } from '../../services/health';
import { useHealthStore } from '../../stores/healthStore';
import { useWebSocketStore } from '../../stores/wsStore';
import { Server, Database, DatabaseZap, Activity, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

export function HealthPanel() {
  const health = useHealthStore();
  const wsState = useWebSocketStore();

  const { data, isError } = useQuery({
    queryKey: ['health'],
    queryFn: healthApi.checkBackendHealth,
    refetchInterval: 10000,
  });

  // Derived WS Status
  let wsStatus = 'Disconnected';
  if (wsState.isConnected) {
    wsStatus = 'Connected';
  } else if (wsState.reconnectAttempts > 0) {
    wsStatus = 'Reconnecting';
  } else {
    wsStatus = 'Connecting'; // Or Disconnected if intentionally closed, but usually it tries to connect
  }

  useEffect(() => {
    if (data) {
      health.updateAll({
        api: 'Connected',
        database: data.database === 'connected' ? 'Connected' : 'Degraded',
        redis: 'Connected', 
        agent: 'Connected',
        websocket: wsStatus as any,
      });
    } else if (isError) {
      health.updateAll({
        api: 'Disconnected',
        database: 'Unknown',
        redis: 'Unknown',
        agent: 'Unknown',
        websocket: wsStatus as any,
      });
    } else {
      health.updateAll({
        websocket: wsStatus as any,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isError, wsStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Connected': return { bg: 'var(--status-normal)', pulsing: false };
      case 'Degraded': return { bg: 'var(--status-active)', pulsing: false };
      case 'Reconnecting': return { bg: 'var(--status-active)', pulsing: true };
      case 'Connecting': return { bg: 'var(--green-light)', pulsing: true };
      case 'Disconnected': return { bg: 'var(--status-error)', pulsing: false };
      default: return { bg: 'var(--text-muted)', pulsing: false };
    }
  };

  const services = [
    { name: 'API', icon: Server, status: health.api },
    { name: 'Database', icon: Database, status: health.database },
    { name: 'Redis', icon: DatabaseZap, status: health.redis },
    { name: 'Agent', icon: Activity, status: health.agent },
    { name: 'WebSocket', icon: Zap, status: health.websocket },
  ];

  return (
    <div 
      className="rounded-lg p-6 border"
      style={{
        backgroundColor: 'var(--surface-secondary)',
        borderColor: 'var(--border)',
      }}
    >
      <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--foreground)' }}>System Health</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {services.map((svc) => {
          const statusColor = getStatusColor(svc.status);
          return (
            <div 
              key={svc.name} 
              className="flex flex-col items-center p-4 rounded-md border gap-3"
              style={{
                backgroundColor: 'var(--surface-primary)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="relative">
                <svc.icon className="h-6 w-6" style={{ color: 'var(--text-tertiary)' }} />
                <span 
                  className={cn("absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2", statusColor.pulsing ? "animate-pulse" : "")}
                  style={{
                    backgroundColor: statusColor.bg,
                    borderColor: 'var(--surface-primary)',
                  }}
                />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{svc.name}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{svc.status}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
