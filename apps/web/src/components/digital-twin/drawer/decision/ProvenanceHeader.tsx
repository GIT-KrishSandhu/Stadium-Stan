import React from 'react';
import { GitBranch, Fingerprint, Clock } from 'lucide-react';

export function ProvenanceHeader({ decision }: { decision: any }) {
  if (!decision.simulation_id) return null;

  return (
    <div className="flex flex-col gap-2 p-3 bg-gray-900 border border-gray-800 rounded-lg">
      <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
        <Fingerprint className="w-3 h-3" /> Simulation Provenance
      </h3>
      <div className="grid grid-cols-2 gap-4 mt-1">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500">Engine Run</span>
          <span className="text-xs font-mono text-gray-300 flex items-center gap-1">
            <GitBranch className="w-3 h-3 text-blue-500/50" /> {decision.simulation_id.split('_')[0] || decision.simulation_id}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500">Version</span>
          <span className="text-xs font-mono text-gray-300">{decision.simulation_version || 'v1.0.0'}</span>
        </div>
        <div className="flex flex-col col-span-2">
          <span className="text-[10px] text-gray-500">Timestamp</span>
          <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(decision.simulation_timestamp).toLocaleString()}
          </span>
        </div>
        <div className="col-span-2 mt-1">
          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-900/20 text-emerald-500 border border-emerald-900/30">
            commit=False (Preview Mode)
          </span>
        </div>
      </div>
    </div>
  );
}
