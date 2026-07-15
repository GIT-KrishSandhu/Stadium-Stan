import React from 'react';
import { Users, Shield, Cross, Clock } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface Resource {
  type: string;
  available: number;
  assigned: number;
  estimated_arrival: number;
}

interface ResourceAwarenessProps {
  resources: Resource[];
}

export function ResourceAwareness({ resources }: ResourceAwarenessProps) {
  if (!resources || resources.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'volunteers': return <Users className="w-3 h-3" />;
      case 'security': return <Shield className="w-3 h-3" />;
      case 'medical': return <Cross className="w-3 h-3" />;
      default: return <Users className="w-3 h-3" />;
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-gray-400 flex items-center justify-between">
        <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Nearby Resources</span>
      </h3>
      <div className="flex flex-col gap-2">
        {resources.map((res, idx) => (
          <div key={idx} className="p-2 bg-gray-950 rounded border border-gray-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gray-900 rounded text-gray-400">
                {getIcon(res.type)}
              </div>
              <span className="text-xs font-medium text-gray-300">{res.type}</span>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-400" title="Available">
                {res.available}
              </span>
              <span className="flex items-center gap-1 text-blue-400" title="Assigned">
                / {res.assigned}
              </span>
              {res.estimated_arrival > 0 && (
                <span className="flex items-center gap-1 text-gray-500 ml-2" title="ETA">
                  <Clock className="w-3 h-3" /> {res.estimated_arrival}m
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
