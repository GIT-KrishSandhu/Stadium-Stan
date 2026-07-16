import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

export function EvidenceList({ evidence }: { evidence: string[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col mt-2">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between p-2 rounded text-xs font-bold uppercase tracking-wider transition-colors"
        style={{
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border)',
          border: '1px solid',
          color: 'var(--text-secondary)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
        }}
      >
        <span className="flex items-center gap-2"><Search className="w-3 h-3" style={{ color: 'var(--text-muted)' }} /> Supporting Evidence ({evidence.length})</span>
        {expanded ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
      </button>
      
      {expanded && (
        <div 
          className="flex flex-col gap-2 p-3 border border-t-0 rounded-b"
          style={{
            backgroundColor: 'var(--surface-primary)',
            borderColor: 'var(--border)',
          }}
        >
          {evidence.map((ev, idx) => (
            <p 
              key={idx} 
              className="text-xs leading-relaxed pl-2 border-l"
              style={{
                borderLeftColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              {ev}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
