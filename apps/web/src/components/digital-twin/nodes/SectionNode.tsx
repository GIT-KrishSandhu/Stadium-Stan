import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { NodeData } from '../../../stores/graphStore';

export const SectionNode = memo(({ data, selected }: NodeProps<any>) => {
  const risk = data.riskScore || 0;
  
  let riskColor = { bg: 'rgba(109, 133, 23, 0.1)', border: 'rgba(109, 133, 23, 0.3)', text: 'var(--olive)' };
  if (risk > 0.9) riskColor = { bg: 'rgba(220, 38, 38, 0.1)', border: 'rgba(220, 38, 38, 0.3)', text: 'var(--status-error)' };
  else if (risk > 0.75) riskColor = { bg: 'rgba(198, 126, 27, 0.1)', border: 'rgba(198, 126, 27, 0.3)', text: 'var(--status-critical)' };
  else if (risk > 0.5) riskColor = { bg: 'rgba(209, 184, 52, 0.1)', border: 'rgba(209, 184, 52, 0.3)', text: 'var(--status-active)' };

  return (
    <div 
      className="px-3 py-2 flex flex-col gap-1 rounded-md border backdrop-blur-sm transition-all duration-300 min-w-[140px] cursor-pointer group"
      style={{
        backgroundColor: selected ? 'var(--surface-secondary)' : riskColor.bg,
        borderColor: riskColor.border,
        boxShadow: selected ? '0 0 20px rgba(209, 184, 52, 0.3)' : 'none',
        transform: selected ? 'scale(1.08)' : 'scale(1)',
        zIndex: selected ? 50 : 1,
        color: riskColor.text,
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.boxShadow = '0 0 15px rgba(209, 184, 52, 0.2)';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <Handle type="target" position={Position.Top} style={{ backgroundColor: 'var(--olive)' }} />
      <div className="flex flex-col items-center gap-1">
        <Users className="w-4 h-4 opacity-70" />
        <span className="text-xs font-semibold">{data.name}</span>
        <span className="text-xs font-mono">{data.occupancy.toLocaleString()} / 10k</span>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ backgroundColor: 'var(--olive)' }} />
    </div>
  );
});

SectionNode.displayName = 'SectionNode';
