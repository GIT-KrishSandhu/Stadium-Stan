import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { LogIn, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { NodeData } from '../../../stores/graphStore';

export const GateNode = memo(({ data, selected }: NodeProps<any>) => {
  const risk = data.riskScore || 0;
  const isClosed = data.status === 'closed';
  
  let riskColor = { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', text: 'var(--green-success)' };
  if (risk > 0.9) riskColor = { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: 'var(--red-incident)' };
  else if (risk > 0.75) riskColor = { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', text: 'var(--amber-warning)' };
  else if (risk > 0.5) riskColor = { bg: 'rgba(234, 179, 8, 0.1)', border: 'rgba(234, 179, 8, 0.3)', text: 'var(--yellow-caution)' };

  return (
    <div 
      className="px-4 py-2 rounded-lg border-2 shadow-lg backdrop-blur-md min-w-[150px] transition-all cursor-pointer"
      style={{
        backgroundColor: isClosed ? 'var(--surface-primary)' : riskColor.bg,
        borderColor: isClosed ? 'var(--border)' : riskColor.border,
        borderStyle: isClosed ? 'dashed' : 'solid',
        opacity: isClosed ? 0.5 : 1,
        boxShadow: selected ? `0 0 20px rgba(0, 102, 255, 0.3)` : 'none',
        transform: selected ? 'scale(1.05)' : 'scale(1)',
        zIndex: selected ? 50 : 1,
        color: riskColor.text,
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 102, 255, 0.2)';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <Handle type="target" position={Position.Top} style={{ width: '8px', height: '8px', backgroundColor: 'var(--graphite-400)' }} />
      <div className="flex items-center gap-2 mb-1 border-b pb-1 opacity-80" style={{ borderBottomColor: 'currentColor' }}>
        <LogIn className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">{data.name}</span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="font-mono">{data.occupancy.toLocaleString()}</span>
        {data.incidentSeverity ? (
          <AlertTriangle className="w-4 h-4 animate-pulse" style={{ color: 'var(--red-incident)' }} />
        ) : (
          <CheckCircle2 className="w-4 h-4 opacity-50" />
        )}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ width: '8px', height: '8px', backgroundColor: 'var(--graphite-400)' }} />
    </div>
  );
});

GateNode.displayName = 'GateNode';
