import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Cross, AlertTriangle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { NodeData } from '../../../stores/graphStore';

export const MedicalNode = memo(({ data, selected }: NodeProps<any>) => {
  const isBusy = data.occupancy > 5;
  
  return (
    <div 
      className="px-3 py-2 flex flex-col gap-1 rounded-md border backdrop-blur-sm transition-all duration-300 min-w-[140px] cursor-pointer group hover:shadow-lg"
      style={{
        backgroundColor: isBusy 
          ? selected ? 'rgba(127, 29, 29, 0.6)' : 'rgba(127, 29, 29, 0.2)'
          : selected ? 'var(--surface-secondary)' : 'var(--surface-primary)',
        borderColor: isBusy 
          ? selected ? 'var(--red-incident)' : 'rgba(239, 68, 68, 0.4)'
          : selected ? 'var(--red-incident)' : 'rgba(239, 68, 68, 0.2)',
        boxShadow: selected && isBusy ? '0 0 20px rgba(239, 68, 68, 0.3)' : 'none',
        transform: selected ? 'scale(1.08)' : 'scale(1)',
        zIndex: selected ? 50 : 1,
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'var(--red-incident)';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = isBusy 
            ? 'rgba(239, 68, 68, 0.4)' 
            : 'rgba(239, 68, 68, 0.2)';
        }
      }}
    >
      <Handle type="target" position={Position.Left} style={{ backgroundColor: 'var(--olive)' }} />
      <Cross className="w-5 h-5" style={{ color: 'var(--red-incident)' }} />
      <Handle type="source" position={Position.Right} style={{ backgroundColor: 'var(--olive)' }} />
    </div>
  );
});

MedicalNode.displayName = 'MedicalNode';
