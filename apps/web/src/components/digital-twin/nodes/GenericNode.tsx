import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { HelpCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { NodeData } from '../../../stores/graphStore';

export const GenericNode = memo(({ data, selected }: NodeProps<any>) => {
  return (
    <div className={cn(
      "px-3 py-2 flex flex-col gap-1 rounded-md border backdrop-blur-sm transition-all duration-300 min-w-[140px]",
      "hover:ring-2 hover:ring-gray-500/50 hover:shadow-[0_0_15px_rgba(156,163,175,0.3)] cursor-pointer group",
      selected ? "ring-2 ring-gray-500 shadow-[0_0_20px_rgba(156,163,175,0.5)] scale-110 z-50 bg-gray-900" : "bg-gray-900/90 border-gray-700"
    )}>
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      <HelpCircle className="w-3 h-3" />
      <span>{data.name}</span>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
});

GenericNode.displayName = 'GenericNode';
