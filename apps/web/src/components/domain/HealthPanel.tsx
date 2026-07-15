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
      case 'Connected': return 'bg-emerald-500';
      case 'Degraded': return 'bg-yellow-500';
      case 'Reconnecting': return 'bg-orange-500 animate-pulse';
      case 'Connecting': return 'bg-blue-500 animate-pulse';
      case 'Disconnected': return 'bg-red-500';
      default: return 'bg-gray-500';
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
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 shadow-sm backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {services.map((svc) => (
          <div key={svc.name} className="flex flex-col items-center p-4 rounded-lg bg-gray-950 border border-gray-800 gap-3">
            <div className="relative">
              <svc.icon className="h-6 w-6 text-gray-400" />
              <span className={cn(
                "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-gray-950",
                getStatusColor(svc.status)
              )} />
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-200">{svc.name}</div>
              <div className="text-xs text-gray-500">{svc.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
