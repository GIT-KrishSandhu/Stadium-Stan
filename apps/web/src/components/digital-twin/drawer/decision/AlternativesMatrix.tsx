import React from 'react';
import { GitCompare, XCircle } from 'lucide-react';
import { cn } from '../../../../lib/utils';

export function AlternativesMatrix({ alternatives }: { alternatives: any[] }) {
  return (
    <div className="flex flex-col gap-2 mt-2">
      <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-1" style={{ color: 'var(--text-secondary)' }}>
        <GitCompare className="w-3 h-3" style={{ color: 'var(--text-muted)' }} /> Alternatives Evaluated
      </h3>
      <div className="overflow-hidden rounded border" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-left text-xs">
          <thead style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--text-muted)' }}>
            <tr>
              <th className="p-2 font-medium">Alternative</th>
              <th className="p-2 font-medium">Predicted Risk</th>
              <th className="p-2 font-medium text-right">Confidence</th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: 'var(--surface-primary)', borderTop: `1px solid var(--border)` }}>
            {alternatives.map((alt, idx) => (
              <React.Fragment key={idx}>
                <tr style={{ borderBottom: `1px solid var(--border)` }}>
                  <td className="p-2 font-medium" style={{ color: 'var(--foreground)' }}>{alt.title}</td>
                  <td className="p-2 font-mono" style={{ color: 'var(--green-success)' }}>{alt.predicted_risk.toFixed(2)}</td>
                  <td className="p-2 text-right font-mono" style={{ color: 'var(--text-secondary)' }}>{(alt.confidence * 100).toFixed(0)}%</td>
                </tr>
                <tr>
                  <td colSpan={3} className="p-2 pt-0 pb-3" style={{ backgroundColor: 'rgba(var(--surface-primary-rgb), 0.5)' }}>
                    <div 
                      className="flex gap-2 items-start p-2 rounded border"
                      style={{
                        backgroundColor: 'rgba(245, 158, 11, 0.08)',
                        borderColor: 'rgba(245, 158, 11, 0.2)',
                        color: 'var(--amber-warning)',
                      }}
                    >
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
