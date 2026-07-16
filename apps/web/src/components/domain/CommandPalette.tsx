import React, { useEffect, useState, useRef } from 'react';
import { Search, MapPin, AlertCircle, Cpu, X } from 'lucide-react';
import { useGraphStore } from '../../stores/graphStore';
import { useSelectionStore } from '../../stores/selectionStore';
import { cn } from '../../lib/utils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const nodes = useGraphStore(state => state.nodes);
  const setSelectedNode = useSelectionStore(state => state.setSelectedNode);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearch('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredNodes = nodes.filter(n => 
    n.data.name.toLowerCase().includes(search.toLowerCase()) || 
    n.id.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5);

  // Mocking incident search for this UI prototype sprint
  const filteredIncidents = search.toLowerCase() === 'incident' ? [
    { id: 'INC-102', name: 'Crowd surge detected at Medical-A', node: 'med-1' }
  ] : [];

  const handleSelectNode = (id: string) => {
    setSelectedNode(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh]">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
        className="relative w-full max-w-lg rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border"
        style={{
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div 
          className="flex items-center px-4 py-3 border-b"
          style={{ borderBottomColor: 'var(--border-subtle)' }}
        >
          <Search className="w-5 h-5 mr-3" style={{ color: 'var(--text-tertiary)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search nodes, incidents, or simulations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none focus:outline-none text-sm"
            style={{
              color: 'var(--foreground)',
              caretColor: 'var(--blue-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.outlineColor = 'transparent';
            }}
          />
          <button 
            onClick={onClose}
            className="p-1 rounded text-xs border transition-all duration-200"
            style={{
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border)',
              color: 'var(--text-tertiary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-primary)';
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            ESC
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {search === '' && (
            <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              Type to search...
            </div>
          )}

          {search !== '' && filteredNodes.length > 0 && (
            <div className="mb-4">
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Nodes</h3>
              <div className="flex flex-col gap-1">
                {filteredNodes.map(node => (
                  <button
                    key={node.id}
                    onClick={() => handleSelectNode(node.id)}
                    className="flex items-center justify-between w-full px-3 py-2 text-left rounded-md transition-colors duration-200 group"
                    style={{
                      color: 'var(--text-secondary)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
                      e.currentTarget.style.color = 'var(--foreground)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                      <span className="text-sm font-medium">{node.data.name}</span>
                    </div>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{node.id}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {search !== '' && filteredIncidents.length > 0 && (
            <div className="mb-4">
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Active Incidents</h3>
              <div className="flex flex-col gap-1">
                {filteredIncidents.map(inc => (
                  <button
                    key={inc.id}
                    onClick={() => handleSelectNode(inc.node)}
                    className="flex items-center justify-between w-full px-3 py-2 text-left rounded-md transition-colors duration-200 group"
                    style={{
                      color: 'var(--text-secondary)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
                      e.currentTarget.style.color = 'var(--foreground)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-4 h-4" style={{ color: 'var(--red-incident)' }} />
                      <span className="text-sm font-medium">{inc.name}</span>
                    </div>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{inc.id}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {search !== '' && filteredNodes.length === 0 && filteredIncidents.length === 0 && (
            <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No results found for "{search}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
