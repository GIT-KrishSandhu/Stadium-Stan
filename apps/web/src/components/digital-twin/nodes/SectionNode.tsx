import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { NodeData } from '../../../stores/graphStore';

export const SectionNode = memo(({ data, selected }: NodeProps<any>) => {
  const risk = data.riskScore || 0;
  
  let riskColor = { bg: 'rgba(0, 102, 255, 0.1)', border: 'rgba(0, 102, 255, 0.3)', text: 'var(--blue-primary)' };
  if (risk > 0.9) riskColor = { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: 'var(--red-incident)' };
  else if (risk > 0.75) riskColor = { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', text: 'var(--amber-warning)' };
  else if (risk > 0.5) riskColor = { bg: 'rgba(234, 179, 8, 0.1)', border: 'rgba(234, 179, 8, 0.3)', text: 'var(--yellow-caution)' };

  return (
    <div 
      className="px-3 py-2 flex flex-col gap-1 rounded-md border backdrop-blur-sm transition-all duration-300 min-w-[140px] cursor-pointer group"
      style={{
        backgroundColor: selected ? 'var(--surface-secondary)' : riskColor.bg,
        borderColor: riskColor.border,
        boxShadow: selected ? '0 0 20px rgba(0, 102, 255, 0.3)' : 'none',
        transform: selected ? 'scale(1.08)' : 'scale(1)',
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
      <Handle type="target" position={Position.Top} style={{ backgroundColor: 'var(--graphite-400)' }} />
      <div className="flex flex-col items-center gap-1">
        <Users className="w-4 h-4 opacity-70" />
        <span className="text-xs font-semibold">{data.name}</span>
        <span className="text-xs font-mono">{data.occupancy.toLocaleString()} / 10k</span>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ backgroundColor: 'var(--graphite-400)' }} />
    </div>
  );
});

SectionNode.displayName = 'SectionNode';
