import React from 'react';
import { Activity, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface OccupancyPoint {
  t: number;
  value: number;
}

interface TemporalContextProps {
  currentOccupancy: number;
  history: OccupancyPoint[];
  forecast: OccupancyPoint[];
  riskTrend: string;
}

export function TemporalContext({ currentOccupancy, history, forecast, riskTrend }: TemporalContextProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'INCREASING':
      case 'SPIKE':
        return <ArrowUp className="w-4 h-4 text-red-500" />;
      case 'DECREASING':
        return <ArrowDown className="w-4 h-4 text-emerald-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const prev = history.find(h => h.t < 0)?.value || currentOccupancy;
  const next = forecast.find(f => f.t > 0)?.value || currentOccupancy;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-gray-400 flex items-center justify-between">
        <span className="flex items-center gap-2"><Activity className="w-4 h-4" /> Temporal Context</span>
        <span className="flex items-center gap-1 text-xs">Risk: {getTrendIcon(riskTrend)}</span>
      </h3>
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 bg-gray-950 rounded-lg border border-gray-800 flex flex-col items-center">
          <span className="text-[10px] text-gray-500 uppercase">-5 Mins</span>
          <span className="text-sm font-mono text-gray-400">{prev}</span>
        </div>
        <div className="p-2 bg-blue-900/20 rounded-lg border border-blue-900/30 flex flex-col items-center">
          <span className="text-[10px] text-blue-400 uppercase">Current</span>
          <span className="text-sm font-mono font-bold text-white">{currentOccupancy}</span>
        </div>
        <div className="p-2 bg-gray-950 rounded-lg border border-gray-800 flex flex-col items-center">
          <span className="text-[10px] text-gray-500 uppercase">+5 Mins</span>
          <span className="text-sm font-mono text-gray-400">{next}</span>
        </div>
      </div>
    </div>
  );
}
