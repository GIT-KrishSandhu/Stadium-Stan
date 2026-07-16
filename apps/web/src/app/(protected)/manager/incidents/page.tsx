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
      case 'critical': return 'text-red-500 bg-red-900/20 border-red-900/50';
      case 'high': return 'text-orange-500 bg-orange-900/20 border-orange-900/50';
      case 'medium': return 'text-yellow-500 bg-yellow-900/20 border-yellow-900/50';
      case 'low': return 'text-blue-500 bg-blue-900/20 border-blue-900/50';
      default: return 'text-gray-400 bg-gray-800 border-gray-700';
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Incidents & Alerts</h1>
      </div>
      
      <div className="flex-1 bg-gray-950 border border-gray-800 rounded-xl overflow-hidden flex flex-col relative">
        <div className="p-4 border-b border-gray-800 bg-gray-900">
          <h2 className="text-lg font-bold text-white">Active Incidents</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : !incidents || incidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-800 rounded-lg">
              <span className="text-gray-500">No active incidents found.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {incidents.map((incident: any) => (
                <div 
                  key={incident.id}
                  onClick={() => handleIncidentClick(incident.node_id)}
                  className={cn(
                    "bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3 transition-all",
                    incident.node_id ? "cursor-pointer hover:border-gray-600 hover:shadow-lg hover:shadow-gray-900/50" : "opacity-80"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-gray-400" />
                      <span className="text-lg font-bold text-white capitalize">{incident.incident_type.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded border uppercase font-bold tracking-wider",
                        getSeverityColor(incident.severity)
                      )}>
                        {incident.severity}
                      </span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider",
                        incident.status === 'open' ? "bg-red-900/30 text-red-400 border border-red-900/50" : "bg-gray-800 text-gray-400 border border-gray-700"
                      )}>
                        {incident.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {incident.node_id && (
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>Location: {nodes.find((n: any) => n.id === incident.node_id)?.name || incident.node_id}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>ID: {incident.id.split('-')[0]}...</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Floating notifications still persist here but we don't need them inside the container normally, NotificationSystem is fixed to bottom-right */}
        <NotificationSystem />
      </div>
    </div>
  );
}
