import React, { useState } from 'react';
import { Play, ArrowRight, Activity, Percent } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { api } from '../../../services/api';

interface SimulationComparisonProps {
  venueId: string;
  nodeId: string;
  currentOccupancy: number;
  currentRisk: number;
}

export function SimulationComparison({ venueId, nodeId, currentOccupancy, currentRisk }: SimulationComparisonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSimulate = async (action: string) => {
    setLoading(true);
    try {
      const res = await api.post('/simulations/preview', {
        venue_id: venueId,
        scenario: action,
        parameters: { target: nodeId }
      });
      setResult(res.data);
    } catch (e) {
      console.error("Simulation failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
        <Play className="w-4 h-4" /> Simulation Preview
      </h3>
      
      <div className="flex gap-2">
        <button 
          onClick={() => handleSimulate('redirect_crowd')}
          className="flex-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs font-medium transition-colors"
          disabled={loading}
        >
          Redirect Crowd
        </button>
        <button 
          onClick={() => handleSimulate('open_alternate_gate')}
          className="flex-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs font-medium transition-colors"
          disabled={loading}
        >
          Open Alt Gate
        </button>
      </div>

      {loading && (
        <div className="p-4 border border-gray-800 rounded-lg bg-gray-950 flex justify-center items-center">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500"></div>
        </div>
      )}

      {result && !loading && (
        <div className="p-3 border border-blue-900/30 bg-blue-900/10 rounded-lg flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-xs font-semibold text-blue-400 uppercase">{result.action} Impact</div>
          
          <div className="flex items-center justify-between">
            {/* Baseline */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-gray-500 uppercase">Baseline Risk</span>
              <span className="text-sm font-mono text-gray-300">{currentRisk.toFixed(2)}</span>
            </div>
            
            <ArrowRight className="w-4 h-4 text-blue-500/50" />
            
            {/* Predicted */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-blue-400 uppercase">Predicted Risk</span>
              <span className="text-sm font-mono font-bold text-emerald-400">
                {(currentRisk - result.risk_reduction).toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-1 text-xs text-emerald-500 bg-emerald-500/10 rounded py-1 px-2">
            <Percent className="w-3 h-3" />
            {(result.risk_reduction * 100).toFixed(0)}% Risk Reduction
          </div>
        </div>
      )}
    </div>
  );
}
