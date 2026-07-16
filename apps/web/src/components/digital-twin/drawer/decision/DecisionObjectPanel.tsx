import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, History, ArrowLeft, Loader2, Play } from 'lucide-react';
import { api } from '../../../../services/api';
import { cn } from '../../../../lib/utils';
import { ProvenanceHeader } from './ProvenanceHeader';
import { OperationalMetrics } from './OperationalMetrics';
import { DecisionConstraints } from './DecisionConstraints';
import { EvidenceList } from './EvidenceList';
import { AlternativesMatrix } from './AlternativesMatrix';
import { DecisionTimeline } from './DecisionTimeline';
import { RecommendationHistory } from './RecommendationHistory';
import { ExecutionStatusTracker } from './ExecutionStatusTracker';

export function DecisionObjectPanel({ nodeId, onClose }: { nodeId: string, onClose: () => void }) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const handleWsEvent = (e: any) => {
      if (e.detail?.node === nodeId) {
        queryClient.invalidateQueries({ queryKey: ['recommendations', nodeId] });
      }
    };
    
    window.addEventListener('EXECUTION_COMPLETED', handleWsEvent);
    return () => window.removeEventListener('EXECUTION_COMPLETED', handleWsEvent);
  }, [nodeId, queryClient]);
  
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['recommendations', nodeId],
    queryFn: async () => {
      const res = await api.get(`/nodes/${nodeId}/recommendations`);
      return res.data;
    },
    enabled: !!nodeId
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => await api.post(`/actions/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations', nodeId] });
    }
  });

  const executeMutation = useMutation({
    mutationFn: async (id: string) => await api.post(`/actions/${id}/execute`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations', nodeId] });
    }
  });

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const handleApproveAndExecute = async (id: string) => {
    await approveMutation.mutateAsync(id);
    await executeMutation.mutateAsync(id);
  };

  const handleExecute = (id: string) => {
    executeMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-gray-950 border-l border-gray-800 w-[500px] shadow-2xl z-20 absolute right-0 top-0">
        {/* Skeleton Header */}
        <div className="p-4 border-b border-gray-800 bg-gray-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-800 rounded animate-pulse" />
            <div>
              <div className="w-32 h-4 bg-gray-800 rounded animate-pulse mb-2" />
              <div className="w-24 h-2 bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
          <div className="w-20 h-6 bg-gray-800 rounded animate-pulse" />
        </div>

        {/* Skeleton Body */}
        <div className="flex-1 p-4 flex flex-col gap-6 overflow-hidden">
          <div className="w-full h-16 bg-gray-900 rounded-lg animate-pulse" />
          
          <div className="flex flex-col gap-2 mt-4">
            <div className="w-3/4 h-6 bg-gray-800 rounded animate-pulse" />
            <div className="w-full h-4 bg-gray-900 rounded animate-pulse mt-2" />
            <div className="w-5/6 h-4 bg-gray-900 rounded animate-pulse" />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="w-full h-24 bg-gray-900 rounded-xl animate-pulse" />
            <div className="w-full h-24 bg-gray-900 rounded-xl animate-pulse" />
          </div>

          <div className="w-full h-32 bg-gray-900 rounded-xl animate-pulse mt-6" />
        </div>
        
        {/* Skeleton Footer */}
        <div className="p-4 bg-gray-900 border-t border-gray-800 flex gap-2">
          <div className="flex-1 h-10 bg-gray-800 rounded animate-pulse" />
          <div className="flex-1 h-10 bg-gray-800 rounded animate-pulse" />
          <div className="flex-1 h-10 bg-gray-800 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // Active decision is anything not purely rejected or not archived, or just pending/ready/executing
  const activeDecision = recommendations?.find((r: any) => 
    r.status === 'pending' || 
    r.execution_status === 'READY_FOR_EXECUTION' || 
    r.execution_status === 'EXECUTING'
  ) || recommendations?.find((r: any) => r.execution_status === 'COMPLETED' || r.execution_status === 'FAILED');
  
  const history = recommendations?.filter((r: any) => r.id !== activeDecision?.id) || [];

  if (!activeDecision) {
    return (
      <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800 w-[500px] z-20 absolute right-0 top-0">
        <div className="p-4 border-b border-gray-800 flex items-center gap-3">
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-white tracking-wider">Recommendation History</h2>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <RecommendationHistory history={history} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-950 border-l border-gray-800 w-[500px] shadow-2xl animate-in slide-in-from-right-8 z-20 absolute right-0 top-0">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Operational Decision
            </h2>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">#{activeDecision.id.split('-')[0]}</span>
          </div>
        </div>
        <div className="px-2 py-1 rounded text-xs font-bold uppercase tracking-wider bg-blue-900/20 text-blue-400 border border-blue-900/30">
          {activeDecision.execution_status !== 'PENDING' ? activeDecision.execution_status.replace(/_/g, ' ') : activeDecision.status}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        <ProvenanceHeader decision={activeDecision} />
        
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-white">{activeDecision.action}</h3>
          <p className="text-sm text-gray-400 leading-relaxed border-l-2 border-blue-500 pl-3 mt-1">
            {activeDecision.operational_summary}
          </p>
        </div>

        {activeDecision.metrics && (
          <div className="flex flex-col gap-4">
            <OperationalMetrics metrics={activeDecision.metrics} />
            <DecisionConstraints metrics={activeDecision.metrics} />
          </div>
        )}

        {/* Execution Tracker injected dynamically */}
        <ExecutionStatusTracker 
          status={activeDecision.execution_status} 
          correlationId={activeDecision.correlation_id}
          result={activeDecision.execution_result}
        />

        {activeDecision.evidence && activeDecision.evidence.length > 0 && (
          <EvidenceList evidence={activeDecision.evidence} />
        )}

        {activeDecision.alternatives && activeDecision.alternatives.length > 0 && (
          <AlternativesMatrix alternatives={activeDecision.alternatives} />
        )}

        <DecisionTimeline timeline={activeDecision.timeline || []} />
      </div>

      {/* Action Footer */}
      {activeDecision.status === 'pending' && (
        <div className="p-4 bg-gray-900 border-t border-gray-800 flex gap-2">
          <button 
            onClick={() => handleApprove(activeDecision.id)}
            disabled={approveMutation.isPending}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 rounded text-sm transition-colors"
          >
            Approve Only
          </button>
          <button 
            onClick={() => handleApproveAndExecute(activeDecision.id)}
            disabled={approveMutation.isPending || executeMutation.isPending}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded text-sm transition-colors"
          >
            Approve & Execute
          </button>
          <button className="flex-1 bg-red-900/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 font-medium py-2 rounded text-sm transition-colors">
            Reject
          </button>
        </div>
      )}

      {activeDecision.execution_status === 'READY_FOR_EXECUTION' && (
        <div className="p-4 bg-gray-900 border-t border-gray-800 flex gap-2">
          <button 
            onClick={() => handleExecute(activeDecision.id)}
            disabled={executeMutation.isPending}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded text-sm transition-colors shadow-lg shadow-emerald-900/20"
          >
            <Play className="w-4 h-4 fill-current" /> Execute Approved Action
          </button>
        </div>
      )}
    </div>
  );
}
