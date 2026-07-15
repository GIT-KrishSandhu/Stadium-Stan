import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { LogIn, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { NodeData } from '../../../stores/graphStore';

export const GateNode = memo(({ data, selected }: NodeProps<any>) => {
  const risk = data.riskScore || 0;
  
  let riskColor = 'border-emerald-500 bg-emerald-500/10 text-emerald-400';
  if (risk > 0.9) riskColor = 'border-red-500 bg-red-500/10 text-red-400';
  else if (risk > 0.75) riskColor = 'border-orange-500 bg-orange-500/10 text-orange-400';
  else if (risk > 0.5) riskColor = 'border-yellow-500 bg-yellow-500/10 text-yellow-400';

  const isClosed = data.status === 'closed';

  return (
    <div className={cn(
      "px-4 py-2 rounded-lg border-2 shadow-lg backdrop-blur-md min-w-[150px] transition-all",
      "hover:ring-2 hover:ring-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] cursor-pointer",
      riskColor,
      selected && "ring-2 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] scale-105 z-50",
      isClosed && "opacity-50 grayscale border-dashed"
    )}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-gray-400" />
      <div className="flex items-center gap-2 mb-1 border-b border-current pb-1 opacity-80">
        <LogIn className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">{data.name}</span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="font-mono">{data.occupancy.toLocaleString()}</span>
        {data.incidentSeverity ? (
          <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
        ) : (
          <CheckCircle2 className="w-4 h-4 opacity-50" />
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-gray-400" />
    </div>
  );
});

GateNode.displayName = 'GateNode';
