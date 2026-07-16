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
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>AI Actions & Executions</h1>
        <div 
          className="flex rounded-lg p-1 border"
          style={{
            backgroundColor: 'var(--surface-primary)',
            borderColor: 'var(--border)',
          }}
        >
          {['all', 'pending', 'executing', 'completed', 'failed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all duration-200"
              style={{
                backgroundColor: filter === f ? 'var(--surface-secondary)' : 'transparent',
                color: filter === f ? 'var(--foreground)' : 'var(--text-tertiary)',
              }}
              onMouseEnter={(e) => {
                if (filter !== f) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== f) {
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Global Queue List */}
        <div 
          className="flex-1 border rounded-lg overflow-y-auto p-4 relative"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
          }}
        >
          <h2 
            className="text-lg font-bold mb-4 sticky top-0 z-10 pb-2 border-b"
            style={{
              color: 'var(--foreground)',
              backgroundColor: 'var(--surface-secondary)',
              borderBottomColor: 'var(--border-subtle)',
            }}
          >
            Global Operational Queue
          </h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--blue-primary)' }} />
            </div>
          ) : filteredActions.length === 0 ? (
            <div 
              className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg"
              style={{
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-muted)',
              }}
            >
              <span>No actions found for this filter.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredActions.map((action: any) => (
                <div 
                  key={action.id}
                  onClick={() => action.node_id && setSelectedNode(action.node_id)}
                  className="rounded-lg p-4 flex flex-col gap-3 transition-all duration-200 border"
                  style={{
                    backgroundColor: 'var(--surface-primary)',
                    borderColor: action.node_id ? 'var(--border)' : 'var(--border-subtle)',
                    cursor: action.node_id ? 'pointer' : 'default',
                    opacity: action.node_id ? 1 : 0.7,
                  }}
                  onMouseEnter={(e) => {
                    if (action.node_id) {
                      e.currentTarget.style.borderColor = 'var(--blue-primary)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 102, 255, 0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (action.node_id) {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(action.status, action.execution_status)}
                      <span className="text-sm font-semibold line-clamp-1" style={{ color: 'var(--foreground)' }}>
                        {action.action}
                      </span>
                    </div>
                    <span 
                      className="text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider ml-2 shrink-0 border"
                      style={{
                        backgroundColor: 'var(--surface-secondary)',
                        color: 'var(--text-secondary)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      {action.execution_status !== 'PENDING' ? action.execution_status.replace(/_/g, ' ') : action.status}
                    </span>
                  </div>
                  
                  <p className="text-xs line-clamp-2" style={{ color: 'var(--text-tertiary)' }}>
                    {action.operational_summary || 'No summary available.'}
                  </p>
                  
                  <div 
                    className="mt-auto pt-3 border-t flex items-center justify-between"
                    style={{ borderTopColor: 'var(--border-subtle)' }}
                  >
                    <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                      ID: {action.id.split('-')[0]}...
                    </span>
                    {action.node_id && (
                      <span 
                        className="text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider border"
                        style={{
                          backgroundColor: 'rgba(0, 102, 255, 0.1)',
                          color: 'var(--blue-primary)',
                          borderColor: 'rgba(0, 102, 255, 0.2)',
                        }}
                      >
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
          <div 
            className="w-[500px] shrink-0 rounded-lg overflow-hidden relative border"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
            }}
          >
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
