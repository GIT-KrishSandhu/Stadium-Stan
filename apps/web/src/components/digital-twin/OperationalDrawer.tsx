'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Activity, Users, ShieldAlert, Cpu } from 'lucide-react';
import { useSelectionStore } from '../../stores/selectionStore';
import { useGraphStore } from '../../stores/graphStore';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../stores/appStore';
import { api } from '../../services/api';
import { TemporalContext } from './drawer/TemporalContext';
import { ResourceAwareness } from './drawer/ResourceAwareness';
import { SimulationComparison } from './drawer/SimulationComparison';
import { DecisionObjectPanel } from './drawer/decision/DecisionObjectPanel';

export function OperationalDrawer() {
  const { venueId } = useAppStore();
  const { selectedNodeId, setSelectedNode } = useSelectionStore();
  const nodes = useGraphStore((state) => state.nodes);
  const [showDecisionPanel, setShowDecisionPanel] = React.useState(false);
  
  // Single fetch for operational context
  const { data: context, isLoading } = useQuery({
    queryKey: ['operational-context', selectedNodeId],
    queryFn: async () => {
      const res = await api.get(`/nodes/${selectedNodeId}/operational-context`);
      return res.data;
    },
    enabled: !!selectedNodeId,
    refetchInterval: 15000 // Refresh every 15s to keep resources semi-live
  });

  if (!selectedNodeId) return null;

  const node = nodes.find(n => n.id === selectedNodeId);
  if (!node) return null;

  const { data: nodeData } = node;
  const isCritical = (nodeData.riskScore || 0) > 0.9;

  return (
    <>
    <div 
      className="flex flex-col h-full w-[500px] shadow-2xl animate-in slide-in-from-right-8 fade-in duration-300 relative z-10 border-l"
      style={{
        backgroundColor: 'var(--surface-secondary)',
        borderLeftColor: 'var(--border)',
      }}
    >
      {/* Header */}
      <div 
        className="p-4 border-b flex items-center justify-between"
        style={{
          borderBottomColor: 'var(--border)',
          backgroundColor: 'var(--surface-primary)',
        }}
      >
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wider" style={{ color: 'var(--foreground)' }}>{nodeData.name}</h2>
          <span className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>{nodeData.type} Node</span>
        </div>
        <button 
          onClick={() => setSelectedNode(null)}
          className="p-1.5 rounded-md transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--foreground)';
            e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 relative">
        {isLoading && !context ? (
          <div 
            className="absolute inset-0 backdrop-blur-sm flex items-center justify-center z-10"
            style={{ backgroundColor: 'var(--surface-secondary)' }}
          >
            <div 
              className="h-6 w-6 animate-spin rounded-full border-2"
              style={{
                borderColor: 'var(--border)',
                borderTopColor: 'var(--blue-primary)',
              }}
            />
          </div>
        ) : null}
        
        {/* Live Metrics (From WebSocket / GraphStore directly to avoid latency) */}
        <div className="grid grid-cols-2 gap-3">
          <div 
            className="col-span-2 p-3 rounded-lg border flex items-center justify-between"
            style={{
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex flex-col">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Live Status</span>
              <div className="flex items-center gap-2 mt-1">
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: nodeData.status === 'closed' ? 'var(--red-incident)' : 'var(--green-success)',
                  }}
                />
                <span className="text-sm font-medium uppercase" style={{ color: 'var(--text-secondary)' }}>{nodeData.status}</span>
              </div>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Live Occupancy</span>
              <span className="text-lg font-mono font-bold" style={{ color: 'var(--foreground)' }}>{nodeData.occupancy.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Temporal Context */}
        {context && (
          <TemporalContext 
            currentOccupancy={context.current_occupancy}
            history={context.occupancy_history}
            forecast={context.occupancy_forecast}
            riskTrend={context.risk_trend}
          />
        )}

        {/* Resources */}
        {context && context.resources && context.resources.length > 0 && (
          <ResourceAwareness resources={context.resources} />
        )}

        {/* Simulation Comparison */}
        {context && (
          <SimulationComparison 
            venueId={venueId}
            nodeId={selectedNodeId}
            currentOccupancy={context.current_occupancy}
            currentRisk={context.current_risk}
          />
        )}

        {/* AI Action Decision Trigger */}
        {context && (
          <div 
            className="mt-auto pt-4 border-t"
            style={{ borderTopColor: 'var(--border)' }}
          >
            <button 
              onClick={() => setShowDecisionPanel(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded font-bold transition-colors"
              style={{
                backgroundColor: 'var(--blue-primary)',
                color: 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--blue-accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--blue-primary)';
              }}
            >
              <Cpu className="w-4 h-4" /> Review Operational Decisions
            </button>
          </div>
        )}

      </div>
    </div>
    
    {showDecisionPanel && (
      <DecisionObjectPanel 
        nodeId={selectedNodeId} 
        onClose={() => setShowDecisionPanel(false)} 
      />
    )}
    </>
  );
}
