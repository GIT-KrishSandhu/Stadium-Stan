import React from 'react';
import { Activity, AlertTriangle, Zap, TrendingDown } from 'lucide-react';
import { cn } from '../../../../lib/utils';

export function OperationalMetrics({ metrics }: { metrics: any }) {
  return (
    <div className="flex flex-col gap-2 mt-2">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
        <Activity className="w-3 h-3" /> Operational Impact
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 bg-gray-900 border border-gray-800 rounded flex items-center justify-between">
          <span className="text-xs text-gray-500">Confidence</span>
          <span className="text-sm font-mono text-white">{(metrics.confidence * 100).toFixed(0)}%</span>
        </div>
        <div className="p-2 bg-gray-900 border border-gray-800 rounded flex items-center justify-between">
          <span className="text-xs text-gray-500">Urgency</span>
          <span className={cn(
            "text-xs font-bold uppercase",
            metrics.operational_urgency === 'HIGH' || metrics.operational_urgency === 'CRITICAL' ? 'text-red-400' : 'text-orange-400'
          )}>
            <AlertTriangle className="w-3 h-3 inline mr-1" /> {metrics.operational_urgency}
          </span>
        </div>
        <div className="p-2 bg-emerald-900/10 border border-emerald-900/30 rounded flex items-center justify-between">
          <span className="text-xs text-gray-500">Risk Drop</span>
          <span className="text-sm font-mono font-bold text-emerald-500 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> {(metrics.predicted_risk_reduction * 100).toFixed(0)}%
          </span>
        </div>
        <div className="p-2 bg-gray-900 border border-gray-800 rounded flex items-center justify-between">
          <span className="text-xs text-gray-500">Impact</span>
          <span className="text-xs font-bold text-blue-400 uppercase">
            <Zap className="w-3 h-3 inline mr-1" /> {metrics.operational_impact}
          </span>
        </div>
      </div>
    </div>
  );
}
