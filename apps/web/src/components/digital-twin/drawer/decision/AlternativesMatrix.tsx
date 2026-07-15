import React from 'react';
import { GitCompare, XCircle } from 'lucide-react';
import { cn } from '../../../../lib/utils';

export function AlternativesMatrix({ alternatives }: { alternatives: any[] }) {
  return (
    <div className="flex flex-col gap-2 mt-2">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-1">
        <GitCompare className="w-3 h-3" /> Alternatives Evaluated
      </h3>
      <div className="overflow-hidden rounded border border-gray-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-900 text-gray-500">
            <tr>
              <th className="p-2 font-medium">Alternative</th>
              <th className="p-2 font-medium">Predicted Risk</th>
              <th className="p-2 font-medium text-right">Confidence</th>
            </tr>
          </thead>
          <tbody className="bg-gray-950 divide-y divide-gray-800">
            {alternatives.map((alt, idx) => (
              <React.Fragment key={idx}>
                <tr>
                  <td className="p-2 text-gray-300 font-medium">{alt.title}</td>
                  <td className="p-2 text-emerald-500 font-mono">{alt.predicted_risk.toFixed(2)}</td>
                  <td className="p-2 text-right text-gray-400 font-mono">{(alt.confidence * 100).toFixed(0)}%</td>
                </tr>
                <tr>
                  <td colSpan={3} className="p-2 pt-0 pb-3 bg-gray-950/50">
                    <div className="flex gap-2 items-start text-orange-400/80 bg-orange-950/20 p-2 rounded border border-orange-900/30">
                      <XCircle className="w-3 h-3 mt-0.5 shrink-0" />
                      <span className="leading-relaxed"><strong>Reason Rejected:</strong> {alt.reason_rejected}</span>
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
