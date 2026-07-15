import React from 'react';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface ExecutionStatusTrackerProps {
  status: string;
  correlationId?: string;
  result?: any;
}

export function ExecutionStatusTracker({ status, correlationId, result }: ExecutionStatusTrackerProps) {
  if (status === 'PENDING') return null;

  const isExecuting = status === 'EXECUTING';
  const isReady = status === 'READY_FOR_EXECUTION';
  const isCompleted = status === 'COMPLETED';
  const isFailed = status === 'FAILED' || status === 'CANCELLED';

  const style = isReady ? { bg: 'bg-blue-950/30 text-blue-400', bar: 'bg-blue-500 w-1/4', icon: AlertCircle, label: 'Ready to Execute' } :
                isExecuting ? { bg: 'bg-blue-900/50 text-blue-400', bar: 'bg-blue-400 w-2/3', icon: Loader2, label: 'Executing Action' } :
                isCompleted ? { bg: 'bg-emerald-950/30 text-emerald-400', bar: 'bg-emerald-500 w-full', icon: CheckCircle, label: 'Execution Completed' } :
                { bg: 'bg-red-950/30 text-red-400', bar: 'bg-red-500 w-full', icon: XCircle, label: 'Execution Failed' };

  return (
    <div 
      className={cn(
        "flex flex-col gap-3 p-4 border rounded-xl animate-in fade-in slide-in-from-top-2 duration-300",
        isReady ? "border-blue-900/30 bg-blue-950/10" :
        isExecuting ? "border-blue-500/50 bg-blue-900/10" :
        isCompleted ? "border-emerald-900/50 bg-emerald-950/10" :
        "border-red-900/50 bg-red-950/10"
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-300">Execution Status</h4>
        {correlationId && (
          <span className="text-[10px] font-mono text-gray-500 bg-gray-950 px-2 py-1 rounded border border-gray-800">
            {correlationId.split('-')[0]}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-full", style.bg)}>
          <style.icon className={cn("w-5 h-5", isExecuting && "animate-spin")} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-end mb-1">
            <span className={cn("text-sm font-bold tracking-wide", style.bg.split(' ')[1])}>
              {style.label}
            </span>
            <span className="text-[10px] text-gray-500 uppercase">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
          <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all duration-1000", style.bar, isExecuting && "animate-pulse")} 
              role="progressbar"
              aria-valuenow={isExecuting ? 50 : isCompleted ? 100 : 0}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>
      
      <span className="sr-only">Current execution status is {style.label}.</span>
      
      {result && result.message && (
        <div className={cn(
          "mt-2 p-3 rounded-lg text-sm border backdrop-blur-sm animate-in slide-in-from-top-2",
          result.success ? "bg-emerald-950/30 border-emerald-900/50 text-emerald-300" : "bg-red-950/30 border-red-900/50 text-red-300"
        )}>
          {result.message}
        </div>
      )}
    </div>
  );
}
