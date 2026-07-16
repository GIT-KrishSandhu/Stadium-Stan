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
    <div 
      className="flex flex-col gap-3 mt-4 border-t pt-4"
      style={{ borderTopColor: 'var(--border)' }}
    >
      <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
        <Cpu className="w-4 h-4" style={{ color: 'var(--purple-ai)' }} /> Agent Recommendation
      </h3>
      
      <div 
        className="border rounded-lg p-3 flex flex-col gap-3 transition-colors"
        style={{
          backgroundColor: status === 'approved' ? 'rgba(16, 185, 129, 0.08)' : 'var(--surface-primary)',
          borderColor: status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'var(--border)',
          boxShadow: status === 'approved' ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{mockRec.actions[0].action}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Target: {mockRec.actions[0].target || nodeId}</span>
          </div>
          <span 
            className="px-2 py-0.5 rounded text-[10px] font-bold border"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              color: 'var(--amber-warning)',
              borderColor: 'rgba(245, 158, 11, 0.2)',
            }}
          >
            {mockRec.priority}
          </span>
        </div>

        {/* Reason */}
        <p className="text-xs leading-relaxed border-l-2 pl-2" style={{ color: 'var(--text-secondary)', borderLeftColor: 'var(--blue-primary)' }}>
          {mockRec.reasoning_summary}
        </p>

        {/* Improvement */}
        <div className="flex gap-4 text-xs">
          <div className="flex flex-col">
            <span style={{ color: 'var(--text-muted)' }}>Confidence</span>
            <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{(mockRec.confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="flex flex-col">
            <span style={{ color: 'var(--text-muted)' }}>Predicted Risk Drop</span>
            <span className="font-mono" style={{ color: 'var(--green-success)' }}>-{mockRec.improvement_estimate.improvement_percentage}%</span>
          </div>
        </div>

        {/* Alternatives */}
        <div className="flex flex-col gap-1 mt-1">
          <span className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>Alternatives Evaluated</span>
          {mockRec.alternatives.map((alt, idx) => (
            <div 
              key={idx} 
              className="text-xs flex justify-between p-1.5 rounded border"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <span>{alt.title}</span>
              <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{alt.predicted_risk.toFixed(2)} Risk</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        {status === 'pending' && (
          <div className="flex gap-2 mt-2">
            <button 
              onClick={handleApprove} 
              className="flex-1 flex items-center justify-center gap-1 rounded py-1.5 text-xs font-medium transition-all text-white border"
              style={{
                backgroundColor: 'var(--green-success)',
                borderColor: 'var(--green-success)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              <Check className="w-3 h-3" /> Approve
            </button>
            <button 
              onClick={() => setStatus('modifying')} 
              className="flex-1 flex items-center justify-center gap-1 rounded py-1.5 text-xs font-medium transition-all border"
              style={{
                backgroundColor: 'var(--surface-tertiary)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--border)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
              }}
            >
              <Edit2 className="w-3 h-3" /> Modify
            </button>
            <button 
              onClick={handleReject} 
              className="flex-1 flex items-center justify-center gap-1 border rounded py-1.5 text-xs font-medium transition-all"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'rgba(239, 68, 68, 0.2)',
                color: 'var(--red-incident)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--red-incident)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.color = 'var(--red-incident)';
              }}
            >
              <X className="w-3 h-3" /> Reject
            </button>
          </div>
        )}

        {/* Modifying State */}
        {status === 'modifying' && (
          <div 
            className="flex flex-col gap-2 mt-2 p-2 border rounded"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
            }}
          >
            <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>Modify Instruction</label>
            <input 
              type="text" 
              value={modifiedAction} 
              onChange={(e) => setModifiedAction(e.target.value)}
              className="rounded px-2 py-1 text-sm outline-none"
              style={{
                backgroundColor: 'var(--surface-primary)',
                borderColor: 'var(--border)',
                border: '1px solid',
                color: 'var(--foreground)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--blue-primary)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            />
            {/* Audit trail UI */}
            {modifiedAction !== mockRec.actions[0].action && (
               <div className="flex items-center gap-2 text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                 <span className="line-through">{mockRec.actions[0].action}</span>
                 <span style={{ color: 'var(--blue-primary)' }}>→</span>
                 <span style={{ color: 'var(--blue-primary)' }}>{modifiedAction}</span>
               </div>
            )}
            <div className="flex gap-2 mt-2">
              <button 
                onClick={handleModify} 
                className="flex-1 rounded py-1 text-xs font-medium text-white transition-all border"
                style={{
                  backgroundColor: 'var(--blue-primary)',
                  borderColor: 'var(--blue-primary)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                Submit Modified
              </button>
              <button 
                onClick={() => setStatus('pending')} 
                className="px-3 rounded py-1 text-xs border"
                style={{
                  backgroundColor: 'var(--surface-tertiary)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--border)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Approved State */}
        {status === 'approved' && (
          <div 
            className="flex items-center justify-center gap-2 py-2 rounded text-xs font-medium mt-2 border"
            style={{
              color: 'var(--green-success)',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              borderColor: 'rgba(16, 185, 129, 0.2)',
            }}
          >
            <Check className="w-4 h-4" /> Action Deployed
          </div>
        )}

      </div>
    </div>
  );
}
