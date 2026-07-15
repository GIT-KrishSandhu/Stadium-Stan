import React, { useState } from 'react';
import { Cpu, Check, X, Edit2, ShieldAlert } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { api } from '../../../services/api';

// Mock recommendation for now, since we haven't wired the full agent pipeline to the drawer automatically
// In reality, this would be fetched via `/api/v1/agents/analyze` or from the node context if an incident exists.
const mockRec = {
  action_id: 'act_123',
  action_type: 'CROWD_ACTION',
  priority: 'HIGH',
  reasoning_summary: 'High congestion detected. Redirecting crowd will alleviate pressure on Gate A.',
  confidence: 0.88,
  actions: [{ action: 'Redirect Crowd', target: 'Gate C' }],
  improvement_estimate: {
    baseline_risk: 0.85,
    predicted_risk: 0.60,
    improvement_percentage: 29.4
  },
  alternatives: [
    { title: 'Open Alternate Gate', predicted_risk: 0.70, confidence: 0.75, reason: 'Less effective but requires fewer staff' }
  ]
};

export function AIRecommendationCard({ nodeId }: { nodeId: string }) {
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | 'modifying'>('pending');
  const [modifiedAction, setModifiedAction] = useState(mockRec.actions[0].action);
  
  const handleApprove = async () => {
    try {
      await api.post(`/actions/${mockRec.action_id}/approve`);
      setStatus('approved');
    } catch (e) { console.error(e); }
  };

  const handleReject = async () => {
    try {
      await api.post(`/actions/${mockRec.action_id}/reject`);
      setStatus('rejected');
    } catch (e) { console.error(e); }
  };

  const handleModify = async () => {
    try {
      await api.put(`/actions/${mockRec.action_id}/modify`, { action: modifiedAction });
      setStatus('approved');
    } catch (e) { console.error(e); }
  };

  if (status === 'rejected') return null;

  return (
    <div className="flex flex-col gap-3 mt-4 border-t border-gray-800 pt-4">
      <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
        <Cpu className="w-4 h-4" /> Agent Recommendation
      </h3>
      
      <div className={cn(
        "border rounded-lg p-3 flex flex-col gap-3 transition-colors",
        status === 'approved' ? "bg-emerald-900/10 border-emerald-900/30" : "bg-gray-950 border-gray-700 shadow-lg"
      )}>
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">{mockRec.actions[0].action}</span>
            <span className="text-xs text-gray-500">Target: {mockRec.actions[0].target || nodeId}</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
            {mockRec.priority}
          </span>
        </div>

        {/* Reason */}
        <p className="text-xs text-gray-300 leading-relaxed border-l-2 border-blue-500 pl-2">
          {mockRec.reasoning_summary}
        </p>

        {/* Improvement */}
        <div className="flex gap-4 text-xs">
          <div className="flex flex-col">
            <span className="text-gray-500">Confidence</span>
            <span className="font-mono text-gray-300">{(mockRec.confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Predicted Risk Drop</span>
            <span className="font-mono text-emerald-400">-{mockRec.improvement_estimate.improvement_percentage}%</span>
          </div>
        </div>

        {/* Alternatives */}
        <div className="flex flex-col gap-1 mt-1">
          <span className="text-[10px] text-gray-500 uppercase">Alternatives Evaluated</span>
          {mockRec.alternatives.map((alt, idx) => (
            <div key={idx} className="text-xs text-gray-400 flex justify-between bg-gray-900 p-1.5 rounded border border-gray-800">
              <span>{alt.title}</span>
              <span className="font-mono text-gray-500">{alt.predicted_risk.toFixed(2)} Risk</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        {status === 'pending' && (
          <div className="flex gap-2 mt-2">
            <button onClick={handleApprove} className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded py-1.5 text-xs font-medium transition-colors">
              <Check className="w-3 h-3" /> Approve
            </button>
            <button onClick={() => setStatus('modifying')} className="flex-1 flex items-center justify-center gap-1 bg-gray-800 hover:bg-gray-700 text-white rounded py-1.5 text-xs font-medium transition-colors">
              <Edit2 className="w-3 h-3" /> Modify
            </button>
            <button onClick={handleReject} className="flex-1 flex items-center justify-center gap-1 bg-red-900/50 hover:bg-red-900 border border-red-900 text-white rounded py-1.5 text-xs font-medium transition-colors">
              <X className="w-3 h-3" /> Reject
            </button>
          </div>
        )}

        {/* Modifying State */}
        {status === 'modifying' && (
          <div className="flex flex-col gap-2 mt-2 p-2 bg-gray-900 border border-gray-800 rounded">
            <label className="text-xs text-gray-400">Modify Instruction</label>
            <input 
              type="text" 
              value={modifiedAction} 
              onChange={(e) => setModifiedAction(e.target.value)}
              className="bg-gray-950 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"
            />
            {/* Audit trail UI */}
            {modifiedAction !== mockRec.actions[0].action && (
               <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1">
                 <span className="line-through">{mockRec.actions[0].action}</span>
                 <span className="text-blue-400">→</span>
                 <span className="text-blue-400">{modifiedAction}</span>
               </div>
            )}
            <div className="flex gap-2 mt-2">
              <button onClick={handleModify} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded py-1 text-xs font-medium">
                Submit Modified
              </button>
              <button onClick={() => setStatus('pending')} className="px-3 bg-gray-800 hover:bg-gray-700 text-white rounded py-1 text-xs">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Approved State */}
        {status === 'approved' && (
          <div className="flex items-center justify-center gap-2 text-emerald-400 bg-emerald-900/20 py-2 rounded text-xs font-medium mt-2 border border-emerald-900/50">
            <Check className="w-4 h-4" /> Action Deployed
          </div>
        )}

      </div>
    </div>
  );
}
