import React from 'react';
import { Shield, Clock, Users, Link } from 'lucide-react';
import { cn } from '../../../../lib/utils';

export function DecisionConstraints({ metrics }: { metrics: any }) {
  return (
    <div className="flex flex-col gap-2 mt-2">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
        <Shield className="w-3 h-3" /> Decision Constraints
      </h3>
      <div className="flex flex-col gap-2 text-xs">
        <div className="flex justify-between p-2 bg-gray-900 rounded border border-gray-800">
          <span className="text-gray-500 flex items-center gap-2"><Clock className="w-3 h-3" /> Est. Duration</span>
          <span className="font-mono text-gray-300">{metrics.estimated_execution_time} mins</span>
        </div>
        <div className="flex justify-between p-2 bg-gray-900 rounded border border-gray-800">
          <span className="text-gray-500 flex items-center gap-2"><Link className="w-3 h-3" /> Reversibility</span>
          <span className={cn(
            "font-medium",
            metrics.reversibility === 'HIGH' ? 'text-emerald-400' : 'text-orange-400'
          )}>{metrics.reversibility}</span>
        </div>
        {metrics.required_resources && metrics.required_resources.length > 0 && (
          <div className="flex flex-col p-2 bg-gray-900 rounded border border-gray-800 gap-1.5">
            <span className="text-gray-500 flex items-center gap-2 mb-1"><Users className="w-3 h-3" /> Required Resources</span>
            {metrics.required_resources.map((res: any, idx: number) => (
              <div key={idx} className="flex justify-between text-gray-400 pl-5">
                <span>{res.type}</span>
                <span className="font-mono">{res.count} required</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
