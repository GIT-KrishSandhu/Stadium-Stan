import React from 'react';
import { GitBranch, Fingerprint, Clock } from 'lucide-react';

export function ProvenanceHeader({ decision }: { decision: any }) {
  if (!decision.simulation_id) return null;

  return (
    <div className="flex flex-col gap-2 p-3 border rounded-lg" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
      <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
        <Fingerprint className="w-3 h-3" style={{ color: 'var(--text-muted)' }} /> Simulation Provenance
      </h3>
      <div className="grid grid-cols-2 gap-4 mt-1">
        <div className="flex flex-col">
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Engine Run</span>
          <span className="text-xs font-mono flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
            <GitBranch className="w-3 h-3" style={{ color: 'rgba(0, 102, 255, 0.5)' }} /> {decision.simulation_id.split('_')[0] || decision.simulation_id}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Version</span>
          <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{decision.simulation_version || 'v1.0.0'}</span>
        </div>
        <div className="flex flex-col col-span-2">
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Timestamp</span>
          <span className="text-xs font-mono flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
            <Clock className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
            {new Date(decision.simulation_timestamp).toLocaleString()}
          </span>
        </div>
        <div className="col-span-2 mt-1">
          <span 
            className="px-2 py-0.5 rounded text-[10px] border"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderColor: 'rgba(16, 185, 129, 0.2)',
              color: 'var(--green-success)',
            }}
          >
            commit=False (Preview Mode)
          </span>
        </div>
      </div>
    </div>
  );
}
