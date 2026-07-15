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
    <div className="flex flex-col h-full bg-gray-950 border-l border-gray-800 w-[500px] shadow-2xl animate-in slide-in-from-right-8 fade-in duration-300 relative z-10">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-950">
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">{nodeData.name}</h2>
          <span className="text-xs text-gray-500 uppercase">{nodeData.type} Node</span>
        </div>
        <button 
          onClick={() => setSelectedNode(null)}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 relative">
        {isLoading && !context ? (
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500"></div>
          </div>
        ) : null}
        
        {/* Live Metrics (From WebSocket / GraphStore directly to avoid latency) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 p-3 bg-gray-950 rounded-lg border border-gray-800 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Live Status</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn("w-2 h-2 rounded-full", nodeData.status === 'closed' ? 'bg-red-500' : 'bg-emerald-500')} />
                <span className="text-sm font-medium uppercase text-gray-300">{nodeData.status}</span>
              </div>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xs text-gray-500">Live Occupancy</span>
              <span className="text-lg font-mono font-bold text-gray-200">{nodeData.occupancy.toLocaleString()}</span>
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
          <div className="mt-auto pt-4 border-t border-gray-800">
            <button 
              onClick={() => setShowDecisionPanel(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-colors"
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
