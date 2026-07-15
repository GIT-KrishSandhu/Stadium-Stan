import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Cross, AlertTriangle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { NodeData } from '../../../stores/graphStore';

export const MedicalNode = memo(({ data, selected }: NodeProps<any>) => {
  const isBusy = data.occupancy > 5;
  
  return (
    <div className={cn(
      "px-3 py-2 flex flex-col gap-1 rounded-md border backdrop-blur-sm transition-all duration-300 min-w-[140px]",
      "hover:ring-2 hover:ring-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] cursor-pointer group",
      selected ? "ring-2 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-110 z-50 bg-gray-900" : "bg-gray-900/90",
      isBusy ? "border-red-500/50 bg-red-950/20" : "border-red-500/30"
    )}>
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
      <Cross className="w-5 h-5" />
      <Handle type="source" position={Position.Right} className="!bg-gray-400" />
    </div>
  );
});

MedicalNode.displayName = 'MedicalNode';
