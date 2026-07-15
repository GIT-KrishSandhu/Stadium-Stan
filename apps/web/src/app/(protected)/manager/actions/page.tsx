'use client';
import React, { useState } from 'react';
import { DecisionObjectPanel } from '../../../../components/digital-twin/drawer/decision/DecisionObjectPanel';
import { useSelectionStore } from '../../../../stores/selectionStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../../services/api';
import { Loader2, AlertCircle, ShieldCheck, CheckCircle2, XCircle, Clock, PlayCircle } from 'lucide-react';
import { cn } from '../../../../lib/utils';

export default function ActionsPage() {
  const { selectedNodeId, setSelectedNode } = useSelectionStore();
  const [filter, setFilter] = useState<string>('all');

  const { data: actions, isLoading } = useQuery({
    queryKey: ['global_actions'],
    queryFn: async () => {
      const res = await api.get('/actions');
      return res.data;
    },
    refetchInterval: 5000 // Poll every 5s for global updates
  });

  const getStatusIcon = (status: string, execStatus: string) => {
    if (execStatus === 'EXECUTING') return <PlayCircle className="w-4 h-4 text-blue-400" />;
    if (execStatus === 'COMPLETED') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (execStatus === 'FAILED') return <XCircle className="w-4 h-4 text-red-500" />;
    if (execStatus === 'READY_FOR_EXECUTION') return <AlertCircle className="w-4 h-4 text-orange-400" />;
    if (status === 'pending') return <Clock className="w-4 h-4 text-yellow-500" />;
    if (status === 'approved') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (status === 'rejected') return <XCircle className="w-4 h-4 text-red-500" />;
    return <ShieldCheck className="w-4 h-4 text-gray-400" />;
  };

  const filteredActions = actions?.filter((a: any) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return a.status === 'pending';
    if (filter === 'executing') return a.execution_status === 'EXECUTING';
    if (filter === 'completed') return a.execution_status === 'COMPLETED';
    if (filter === 'failed') return a.execution_status === 'FAILED';
    return true;
  }) || [];

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">AI Actions & Executions</h1>
        <div className="flex bg-gray-900 border border-gray-800 rounded-lg p-1">
          {['all', 'pending', 'executing', 'completed', 'failed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors",
                filter === f ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Global Queue List */}
        <div className="flex-1 bg-gray-950 border border-gray-800 rounded-xl overflow-y-auto p-4 relative">
          <h2 className="text-lg font-bold text-white mb-4 sticky top-0 bg-gray-950 z-10 pb-2 border-b border-gray-900">Global Operational Queue</h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : filteredActions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-800 rounded-lg">
              <span className="text-gray-500">No actions found for this filter.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredActions.map((action: any) => (
                <div 
                  key={action.id}
                  onClick={() => action.node_id && setSelectedNode(action.node_id)}
                  className={cn(
                    "bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3 transition-all",
                    action.node_id ? "cursor-pointer hover:border-gray-600 hover:shadow-lg hover:shadow-gray-900/50" : "opacity-80"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(action.status, action.execution_status)}
                      <span className="text-sm font-bold text-white line-clamp-1">{action.action}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 uppercase font-bold tracking-wider ml-2 shrink-0">
                      {action.execution_status !== 'PENDING' ? action.execution_status.replace(/_/g, ' ') : action.status}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {action.operational_summary || 'No summary available.'}
                  </p>
                  
                  <div className="mt-auto pt-3 border-t border-gray-800 flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-mono">ID: {action.id.split('-')[0]}...</span>
                    {action.node_id && (
                      <span className="text-[10px] bg-blue-900/20 text-blue-400 border border-blue-900/30 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                        Node: {action.node_id.substring(0, 8)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side Drawer */}
        {selectedNodeId && (
          <div className="w-[500px] shrink-0 bg-gray-950 border border-gray-800 rounded-xl overflow-hidden relative">
             <DecisionObjectPanel 
               nodeId={selectedNodeId}
               onClose={() => setSelectedNode(null)}
             />
          </div>
        )}
      </div>
    </div>
  );
}
