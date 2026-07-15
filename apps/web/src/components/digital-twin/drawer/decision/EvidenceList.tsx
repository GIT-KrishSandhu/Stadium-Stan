import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

export function EvidenceList({ evidence }: { evidence: string[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col mt-2">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between p-2 bg-gray-900 border border-gray-800 rounded text-xs font-bold text-gray-400 uppercase tracking-wider hover:bg-gray-800 transition-colors"
      >
        <span className="flex items-center gap-2"><Search className="w-3 h-3" /> Supporting Evidence ({evidence.length})</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      
      {expanded && (
        <div className="flex flex-col gap-2 p-3 bg-gray-950 border border-gray-800 border-t-0 rounded-b">
          {evidence.map((ev, idx) => (
            <p key={idx} className="text-xs text-gray-400 leading-relaxed pl-2 border-l border-gray-700">
              {ev}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
