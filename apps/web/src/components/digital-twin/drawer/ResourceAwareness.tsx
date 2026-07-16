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
      <h3 className="text-sm font-semibold flex items-center justify-between" style={{ color: 'var(--text-secondary)' }}>
        <span className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}><Users className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /> Nearby Resources</span>
      </h3>
      <div className="flex flex-col gap-2">
        {resources.map((res, idx) => (
          <div 
            key={idx} 
            className="p-2 rounded border flex justify-between items-center"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center gap-2">
              <div 
                className="p-1.5 rounded"
                style={{
                  backgroundColor: 'var(--surface-tertiary)',
                  color: 'var(--text-secondary)',
                }}
              >
                {getIcon(res.type)}
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{res.type}</span>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1" style={{ color: 'var(--green-success)' }} title="Available">
                {res.available}
              </span>
              <span className="flex items-center gap-1" style={{ color: 'var(--blue-primary)' }} title="Assigned">
                / {res.assigned}
              </span>
              {res.estimated_arrival > 0 && (
                <span className="flex items-center gap-1 ml-2" style={{ color: 'var(--text-muted)' }} title="ETA">
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
