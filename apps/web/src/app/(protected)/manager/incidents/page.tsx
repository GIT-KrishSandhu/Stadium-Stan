'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../../services/api';
import { useSelectionStore } from '../../../../stores/selectionStore';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Clock, MapPin, Loader2 } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { NotificationSystem } from '../../../../components/domain/NotificationSystem';

export default function IncidentsPage() {
  const router = useRouter();
  const { setSelectedNode } = useSelectionStore();

  const { data: incidents, isLoading } = useQuery({
    queryKey: ['global_incidents'],
    queryFn: async () => {
      const res = await api.get('/incidents');
      return res.data;
    },
    refetchInterval: 5000
  });

  const { data: twinData } = useQuery({
    queryKey: ['twin-nodes', 'metlife'],
    queryFn: async () => {
      const res = await api.get('/venues/metlife/twin');
      return res.data;
    }
  });
  const nodes = twinData?.nodes || [];

  const handleIncidentClick = (nodeId: string | null) => {
    if (nodeId) {
      setSelectedNode(nodeId);
      router.push('/manager/twin');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--red-incident)', border: 'rgba(239, 68, 68, 0.2)' };
      case 'high': return { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--amber-warning)', border: 'rgba(245, 158, 11, 0.2)' };
      case 'medium': return { bg: 'rgba(245, 158, 11, 0.08)', text: 'var(--amber-warning)', border: 'rgba(245, 158, 11, 0.15)' };
      case 'low': return { bg: 'rgba(0, 102, 255, 0.1)', text: 'var(--blue-primary)', border: 'rgba(0, 102, 255, 0.2)' };
      default: return { bg: 'var(--surface-tertiary)', text: 'var(--text-muted)', border: 'var(--border)' };
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Incidents & Alerts</h1>
      </div>
      
      <div 
        className="flex-1 border rounded-lg overflow-hidden flex flex-col relative"
        style={{
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border)',
        }}
      >
        <div 
          className="p-4 border-b"
          style={{
            backgroundColor: 'var(--surface-primary)',
            borderBottomColor: 'var(--border-subtle)',
          }}
        >
          <h2 className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>Active Incidents</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--blue-primary)' }} />
            </div>
          ) : !incidents || incidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
              <span>No active incidents found.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {incidents.map((incident: any) => {
                const severityColor = getSeverityColor(incident.severity);
                const statusColor = incident.status === 'open' 
                  ? { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--red-incident)', border: 'rgba(239, 68, 68, 0.2)' }
                  : { bg: 'var(--surface-tertiary)', text: 'var(--text-muted)', border: 'var(--border)' };
                return (
                  <div 
                    key={incident.id}
                    onClick={() => handleIncidentClick(incident.node_id)}
                    className="rounded-lg p-4 flex flex-col gap-3 transition-all duration-200 border"
                    style={{
                      backgroundColor: 'var(--surface-primary)',
                      borderColor: incident.node_id ? 'var(--border)' : 'var(--border-subtle)',
                      cursor: incident.node_id ? 'pointer' : 'default',
                      opacity: incident.node_id ? 1 : 0.7,
                    }}
                    onMouseEnter={(e) => {
                      if (incident.node_id) {
                        e.currentTarget.style.borderColor = 'var(--blue-primary)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 102, 255, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (incident.node_id) {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" style={{ color: 'var(--amber-warning)' }} />
                        <span className="text-lg font-semibold capitalize" style={{ color: 'var(--foreground)' }}>
                          {incident.incident_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span 
                          className="text-xs px-2 py-0.5 rounded border uppercase font-bold tracking-wider"
                          style={{
                            backgroundColor: severityColor.bg,
                            color: severityColor.text,
                            borderColor: severityColor.border,
                          }}
                        >
                          {incident.severity}
                        </span>
                        <span 
                          className="text-xs px-2 py-0.5 rounded border uppercase font-bold tracking-wider"
                          style={{
                            backgroundColor: statusColor.bg,
                            color: statusColor.text,
                            borderColor: statusColor.border,
                          }}
                        >
                          {incident.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {incident.node_id && (
                        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          <MapPin className="w-4 h-4" />
                          <span>Location: {nodes.find((n: any) => n.id === incident.node_id)?.name || incident.node_id}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <Clock className="w-4 h-4" />
                        <span>ID: {incident.id.split('-')[0]}...</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <NotificationSystem />
      </div>
    </div>
  );
}
