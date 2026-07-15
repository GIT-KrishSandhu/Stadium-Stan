import React from 'react';
import { History, ShieldX } from 'lucide-react';
import { cn } from '../../../../lib/utils';

export function RecommendationHistory({ history }: { history: any[] }) {
  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-900/50 rounded-lg border border-gray-800 border-dashed gap-3">
        <ShieldX className="w-8 h-8 text-gray-600" />
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-gray-400">No Historical Records</span>
          <span className="text-xs text-gray-500">This node has no previously recorded operational decisions.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {history.map((rec: any, idx) => (
        <div key={idx} className="p-3 bg-gray-900 border border-gray-800 rounded-lg flex flex-col gap-2 opacity-70 hover:opacity-100 transition-opacity">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-300">{rec.action}</span>
            <span className={cn(
              "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded",
              rec.status === 'approved' ? 'bg-emerald-900/50 text-emerald-500' :
              rec.status === 'rejected' ? 'bg-red-900/50 text-red-500' : 'bg-gray-800 text-gray-400'
            )}>{rec.status}</span>
          </div>
          <span className="text-[10px] text-gray-500">
            {rec.simulation_timestamp ? new Date(rec.simulation_timestamp).toLocaleString() : 'Unknown Time'}
          </span>
          <p className="text-xs text-gray-400 line-clamp-2">
            {rec.operational_summary}
          </p>
        </div>
      ))}
    </div>
  );
}
