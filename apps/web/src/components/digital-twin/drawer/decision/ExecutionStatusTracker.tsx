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

  const style = isReady 
    ? { bg: 'rgba(0, 102, 255, 0.1)', text: 'var(--blue-primary)', bar: 'var(--blue-primary)', border: 'rgba(0, 102, 255, 0.2)', icon: AlertCircle, label: 'Ready to Execute', width: '25%' } 
    : isExecuting 
    ? { bg: 'rgba(0, 102, 255, 0.15)', text: 'var(--blue-primary)', bar: 'var(--blue-primary)', border: 'rgba(0, 102, 255, 0.3)', icon: Loader2, label: 'Executing Action', width: '65%' } 
    : isCompleted 
    ? { bg: 'rgba(16, 185, 129, 0.1)', text: 'var(--green-success)', bar: 'var(--green-success)', border: 'rgba(16, 185, 129, 0.2)', icon: CheckCircle, label: 'Execution Completed', width: '100%' } 
    : { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--red-incident)', bar: 'var(--red-incident)', border: 'rgba(239, 68, 68, 0.2)', icon: XCircle, label: 'Execution Failed', width: '100%' };

  return (
    <div 
      className="flex flex-col gap-3 p-4 border rounded-xl animate-in fade-in slide-in-from-top-2 duration-300"
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
      }}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold" style={{ color: style.text }}>Execution Status</h4>
        {correlationId && (
          <span 
            className="text-[10px] font-mono px-2 py-1 rounded border"
            style={{
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            {correlationId.split('-')[0]}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div 
          className="p-2 rounded-full"
          style={{
            backgroundColor: style.bg,
            borderColor: style.border,
            border: `1px solid ${style.border}`,
          }}
        >
          <style.icon className={cn("w-5 h-5", isExecuting && "animate-spin")} style={{ color: style.text }} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-end mb-1">
            <span className="text-sm font-bold tracking-wide" style={{ color: style.text }}>
              {style.label}
            </span>
            <span className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>
              {new Date().toLocaleTimeString()}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
            <div 
              className={cn("h-full transition-all duration-1000", isExecuting && "animate-pulse")}
              style={{
                backgroundColor: style.bar,
                width: style.width,
              }} 
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
