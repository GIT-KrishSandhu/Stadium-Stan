'use client';
import React from 'react';
import { useSelectionStore } from '../../../../stores/selectionStore';
import { DecisionTimeline } from '../../../../components/digital-twin/drawer/decision/DecisionTimeline';
import { RecommendationHistory } from '../../../../components/digital-twin/drawer/decision/RecommendationHistory';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../../services/api';
import { Loader2 } from 'lucide-react';

export default function HistoryPage() {
  const { selectedNodeId } = useSelectionStore();

  const { data: actions, isLoading } = useQuery({
    queryKey: ['global_actions'],
    queryFn: async () => {
      const res = await api.get('/actions');
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
  const selectedNodeName = nodes.find((n: any) => n.id === selectedNodeId)?.name || selectedNodeId;

  const filteredActions = selectedNodeId 
    ? actions?.filter((a: any) => a.node_id === selectedNodeId)
    : actions;

  // Extract all timeline events from the actions
  const timeline = filteredActions?.flatMap((a: any) => 
    (a.timeline || []).map((t: any) => ({
      ...t,
      actionId: a.id,
      actionName: a.action
    }))
  ).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) || [];

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Audit History</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
        <div 
          className="border rounded-lg p-6 overflow-y-auto relative"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
          }}
        >
          <h2 
            className="text-lg font-bold mb-4 sticky top-0 pb-2 z-10 border-b"
            style={{
              color: 'var(--foreground)',
              backgroundColor: 'var(--surface-secondary)',
              borderBottomColor: 'var(--border-subtle)',
            }}
          >
            {selectedNodeId ? `Node Timeline: ${selectedNodeName}` : 'Global Timeline'}
          </h2>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--blue-primary)' }} />
            </div>
          ) : (
            <DecisionTimeline timeline={timeline} />
          )}
        </div>

        <div 
          className="border rounded-lg p-6 overflow-y-auto relative"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
          }}
        >
          <h2 
            className="text-lg font-bold mb-4 sticky top-0 pb-2 z-10 border-b"
            style={{
              color: 'var(--foreground)',
              backgroundColor: 'var(--surface-secondary)',
              borderBottomColor: 'var(--border-subtle)',
            }}
          >
            {selectedNodeId ? `Recommendations: ${selectedNodeName}` : 'Recent Recommendations'}
          </h2>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--blue-primary)' }} />
            </div>
          ) : (
            <RecommendationHistory history={filteredActions || []} />
          )}
        </div>
      </div>
    </div>
  );
}
