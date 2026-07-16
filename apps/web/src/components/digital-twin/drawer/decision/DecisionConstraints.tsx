import React from 'react';
import { Shield, Clock, Users, Link } from 'lucide-react';
import { cn } from '../../../../lib/utils';

export function DecisionConstraints({ metrics }: { metrics: any }) {
  const isHighReversibility = metrics.reversibility === 'HIGH';
  
  return (
    <div className="flex flex-col gap-2 mt-2">
      <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
        <Shield className="w-3 h-3" style={{ color: 'var(--text-muted)' }} /> Decision Constraints
      </h3>
      <div className="flex flex-col gap-2 text-xs">
        <div className="flex justify-between p-2 rounded border" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
          <span className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}><Clock className="w-3 h-3" style={{ color: 'var(--text-muted)' }} /> Est. Duration</span>
          <span className="font-mono" style={{ color: 'var(--foreground)' }}>{metrics.estimated_execution_time} mins</span>
        </div>
        <div className="flex justify-between p-2 rounded border" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
          <span className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}><Link className="w-3 h-3" style={{ color: 'var(--text-muted)' }} /> Reversibility</span>
          <span 
            className="font-medium"
            style={{
              color: isHighReversibility ? 'var(--green-success)' : 'var(--amber-warning)',
            }}
          >{metrics.reversibility}</span>
        </div>
        {metrics.required_resources && metrics.required_resources.length > 0 && (
          <div className="flex flex-col p-2 rounded border gap-1.5" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
            <span className="flex items-center gap-2 mb-1" style={{ color: 'var(--text-secondary)' }}><Users className="w-3 h-3" style={{ color: 'var(--text-muted)' }} /> Required Resources</span>
            {metrics.required_resources.map((res: any, idx: number) => (
              <div key={idx} className="flex justify-between pl-5" style={{ color: 'var(--text-secondary)' }}>
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
