import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { NodeData } from '../../../stores/graphStore';

export const SectionNode = memo(({ data, selected }: NodeProps<any>) => {
  const risk = data.riskScore || 0;
  
  let riskColor = 'border-blue-500 bg-blue-500/10 text-blue-400';
  if (risk > 0.9) riskColor = 'border-red-500 bg-red-500/10 text-red-400';
  else if (risk > 0.75) riskColor = 'border-orange-500 bg-orange-500/10 text-orange-400';
  else if (risk > 0.5) riskColor = 'border-yellow-500 bg-yellow-500/10 text-yellow-400';

  return (
    <div className={cn(
      "px-3 py-2 flex flex-col gap-1 rounded-md border backdrop-blur-sm transition-all duration-300 min-w-[140px]",
      "hover:ring-2 hover:ring-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] cursor-pointer group",
      selected ? "ring-2 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] scale-110 z-50 bg-gray-900" : "bg-gray-900/90",
      riskColor
    )}>
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      <div className="flex flex-col items-center gap-1">
        <Users className="w-4 h-4 opacity-70" />
        <span className="text-xs font-semibold">{data.name}</span>
        <span className="text-xs font-mono">{data.occupancy.toLocaleString()} / 10k</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
});

SectionNode.displayName = 'SectionNode';
