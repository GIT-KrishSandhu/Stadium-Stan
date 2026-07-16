import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { LogIn, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { NodeData } from '../../../stores/graphStore';

export const GateNode = memo(({ data, selected }: NodeProps<any>) => {
  const risk = data.riskScore || 0;
  const isClosed = data.status === 'closed';
  
  let riskColor = { bg: 'rgba(45, 122, 74, 0.10)', border: 'rgba(45, 122, 74, 0.3)', text: 'var(--green-primary)' };
  if (risk > 0.9) riskColor = { bg: 'rgba(220, 38, 38, 0.1)', border: 'rgba(220, 38, 38, 0.3)', text: 'var(--status-error)' };
  else if (risk > 0.75) riskColor = { bg: 'rgba(217, 119, 6, 0.1)', border: 'rgba(217, 119, 6, 0.3)', text: 'var(--status-warning)' };
  else if (risk > 0.5) riskColor = { bg: 'rgba(95, 184, 118, 0.10)', border: 'rgba(95, 184, 118, 0.3)', text: 'var(--green-light)' };

  return (
    <div 
      className="px-4 py-2 rounded-lg border-2 shadow-lg backdrop-blur-md min-w-[150px] transition-all cursor-pointer"
      style={{
        backgroundColor: isClosed ? 'var(--surface-primary)' : riskColor.bg,
        borderColor: isClosed ? 'var(--border)' : riskColor.border,
        borderStyle: isClosed ? 'dashed' : 'solid',
        opacity: isClosed ? 0.5 : 1,
        boxShadow: selected ? `0 0 20px rgba(45, 122, 74, 0.3)` : 'none',
        transform: selected ? 'scale(1.05)' : 'scale(1)',
        zIndex: selected ? 50 : 1,
        color: riskColor.text,
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.boxShadow = '0 0 15px rgba(45, 122, 74, 0.2)';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <Handle type="target" position={Position.Top} style={{ width: '8px', height: '8px', backgroundColor: 'var(--green-medium)' }} />
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
      <Handle type="source" position={Position.Bottom} style={{ width: '8px', height: '8px', backgroundColor: 'var(--green-medium)' }} />
    </div>
  );
});

GateNode.displayName = 'GateNode';
