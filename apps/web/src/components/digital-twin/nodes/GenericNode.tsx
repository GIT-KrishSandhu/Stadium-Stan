import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { HelpCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { NodeData } from '../../../stores/graphStore';

export const GenericNode = memo(({ data, selected }: NodeProps<any>) => {
  return (
    <div 
      className="px-3 py-2 flex flex-col gap-1 rounded-md border backdrop-blur-sm transition-all duration-300 min-w-[140px] cursor-pointer group hover:shadow-lg"
      style={{
        backgroundColor: selected ? 'var(--surface-secondary)' : 'var(--surface-primary)',
        borderColor: selected ? 'var(--green-primary)' : 'var(--border)',
        boxShadow: selected ? '0 0 20px rgba(45, 122, 74, 0.3)' : 'none',
        transform: selected ? 'scale(1.08)' : 'scale(1)',
        zIndex: selected ? 50 : 1,
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'var(--text-secondary)';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'var(--border)';
        }
      }}
    >
      <Handle type="target" position={Position.Top} style={{ backgroundColor: 'var(--green-medium)' }} />
      <HelpCircle className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} />
      <span style={{ color: 'var(--foreground)', fontSize: '0.75rem', fontWeight: 500 }}>{data.name}</span>
      <Handle type="source" position={Position.Bottom} style={{ backgroundColor: 'var(--green-medium)' }} />
    </div>
  );
});

GenericNode.displayName = 'GenericNode';
