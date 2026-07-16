import React from 'react';
import { Activity, AlertTriangle, Zap, TrendingDown } from 'lucide-react';
import { cn } from '../../../../lib/utils';

export function OperationalMetrics({ metrics }: { metrics: any }) {
  const isHighUrgency = metrics.operational_urgency === 'HIGH' || metrics.operational_urgency === 'CRITICAL';
  
  return (
    <div className="flex flex-col gap-2 mt-2">
      <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
        <Activity className="w-3 h-3" style={{ color: 'var(--text-muted)' }} /> Operational Impact
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded flex items-center justify-between border" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Confidence</span>
          <span className="text-sm font-mono" style={{ color: 'var(--foreground)' }}>{(metrics.confidence * 100).toFixed(0)}%</span>
        </div>
        <div className="p-2 rounded flex items-center justify-between border" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Urgency</span>
          <span 
            className="text-xs font-bold uppercase flex items-center gap-1"
            style={{
              color: isHighUrgency ? 'var(--red-incident)' : 'var(--amber-warning)',
            }}
          >
            <AlertTriangle className="w-3 h-3" /> {metrics.operational_urgency}
          </span>
        </div>
        <div className="p-2 rounded flex items-center justify-between border" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Risk Drop</span>
          <span className="text-sm font-mono font-bold flex items-center gap-1" style={{ color: 'var(--green-success)' }}>
            <TrendingDown className="w-3 h-3" /> {(metrics.predicted_risk_reduction * 100).toFixed(0)}%
          </span>
        </div>
        <div className="p-2 rounded flex items-center justify-between border" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Impact</span>
          <span className="text-xs font-bold uppercase flex items-center gap-1" style={{ color: 'var(--blue-primary)' }}>
            <Zap className="w-3 h-3" /> {metrics.operational_impact}
          </span>
        </div>
      </div>
    </div>
  );
}
