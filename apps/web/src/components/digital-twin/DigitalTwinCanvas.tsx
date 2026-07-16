'use client';

import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Panel,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Search } from 'lucide-react';
import { useGraphStore } from '../../stores/graphStore';
import { useSelectionStore } from '../../stores/selectionStore';
import { useFilterStore } from '../../stores/filterStore';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { CommandPalette } from '../domain/CommandPalette';
import { useWebSocketStore } from '../../stores/wsStore';
import { GateNode } from './nodes/GateNode';
import { SectionNode } from './nodes/SectionNode';
import { MedicalNode } from './nodes/MedicalNode';
import { GenericNode } from './nodes/GenericNode';

const nodeTypes: any = {
  gate: GateNode,
  section: SectionNode,
  medical: MedicalNode,
  generic: GenericNode,
};

function ConnectionIndicator() {
  const isConnected = useWebSocketStore(state => state.isConnected);
  const reconnectAttempts = useWebSocketStore(state => state.reconnectAttempts);

  if (isConnected) return null;

  return (
    <div 
      className="flex items-center justify-between w-full rounded-lg px-3 py-2 shadow-lg backdrop-blur text-xs animate-in slide-in-from-top-2 duration-300 border"
      style={{
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderColor: 'rgba(239, 68, 68, 0.2)',
      }}
    >
      <div className="flex items-center gap-2" style={{ color: 'var(--red-incident)' }}>
        <div 
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: 'var(--red-incident)' }}
        />
        <span className="font-medium">Disconnected</span>
      </div>
      {reconnectAttempts > 0 && (
        <span style={{ color: 'var(--red-incident)', opacity: 0.7 }}>Reconnecting... ({reconnectAttempts})</span>
      )}
    </div>
  );
}

export function DigitalTwinCanvas() {
  const { nodes: storeNodes, edges: storeEdges, isLoaded } = useGraphStore();
  const setSelectedNode = useSelectionStore((state) => state.setSelectedNode);
  const highlightedPath = useSelectionStore((state) => state.highlightedPath);
  const filters = useFilterStore();

  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

  useEffect(() => {
    if (isLoaded) {
      // Apply filters
      const filteredNodes = storeNodes.filter((node) => {
        const type = node.data.type as string;
        if (type === 'gate' && !filters.showGates) return false;
        if (type === 'section' && !filters.showSections) return false;
        if (type === 'medical' && !filters.showMedical) return false;
        if (type === 'corridor' && !filters.showCorridors) return false;
        if (type === 'elevator' && !filters.showElevators) return false;
        return true;
      }).map((node) => {
        const isHighlighted = highlightedPath.includes(node.id);
        return {
          ...node,
          data: {
            ...node.data,
            isHighlighted
          },
          style: isHighlighted ? {
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.6)',
            border: '2px solid #10b981',
            borderRadius: '8px'
          } : node.style
        };
      });

      const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
      const filteredEdges = storeEdges.filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)).map((edge) => {
        let isPathEdge = false;
        const sourceIndex = highlightedPath.indexOf(edge.source);
        if (sourceIndex !== -1 && sourceIndex < highlightedPath.length - 1) {
          isPathEdge = highlightedPath[sourceIndex + 1] === edge.target;
        }
        return {
          ...edge,
          animated: isPathEdge,
          style: isPathEdge 
            ? { stroke: '#10b981', strokeWidth: 4, filter: 'drop-shadow(0 0 8px #10b981)' }
            : { stroke: '#475569', strokeWidth: 2 }
        };
      });

      setNodes(filteredNodes);
      setEdges(filteredEdges);
    }
  }, [storeNodes, storeEdges, isLoaded, filters, highlightedPath, setNodes, setEdges]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    setSelectedNode(node.id);
  }, [setSelectedNode]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false);

  useKeyboardShortcuts({
    onCommandPalette: () => setIsCommandPaletteOpen(true),
    onEscape: () => setIsCommandPaletteOpen(false),
    onSearch: () => setIsCommandPaletteOpen(true),
  });

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--background)', color: 'var(--text-secondary)' }}>
        <div className="flex flex-col items-center gap-4">
          <div 
            className="w-8 h-8 border-4 rounded-full animate-spin"
            style={{
              borderColor: 'rgba(0, 102, 255, 0.2)',
              borderTopColor: 'var(--blue-primary)',
            }}
          />
          <span>Synchronizing Digital Twin Topology...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative" style={{ backgroundColor: 'var(--background)' }}>
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />
      <div className="absolute top-4 right-4 z-10 w-64 flex flex-col gap-2">
        <ConnectionIndicator />
        <button 
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between border rounded-lg px-4 py-2 text-sm shadow-lg backdrop-blur transition-colors"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--text-secondary)';
            e.currentTarget.style.color = 'var(--foreground)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span>Search...</span>
          </div>
          <kbd 
            className="hidden sm:inline-block border rounded px-1.5 py-0.5 text-[10px] font-mono"
            style={{
              backgroundColor: 'var(--surface-tertiary)',
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        className="dark"
        minZoom={0.1}
        maxZoom={4}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="var(--graphite-600)" />
        <Controls style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', fill: 'var(--text-secondary)' }} />
        <MiniMap 
          nodeColor={(n) => {
            const risk = n.data.riskScore as number || 0;
            if (risk > 0.9) return 'var(--red-incident)';
            if (risk > 0.75) return 'var(--amber-warning)';
            if (risk > 0.5) return 'var(--yellow-caution)';
            return 'var(--green-success)';
          }}
          maskColor="rgba(15, 23, 42, 0.7)"
          style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
        />
        <Panel 
          position="top-left" 
          style={{
            backgroundColor: 'rgba(var(--surface-secondary-rgb), 0.8)',
            borderColor: 'var(--border)',
            backdropFilter: 'blur(10px)',
          }}
          className="border p-2 rounded-lg shadow-lg"
        >
          <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Filters</div>
          <div className="flex flex-col gap-1">
            {Object.entries({
              Gates: 'showGates',
              Sections: 'showSections',
              Medical: 'showMedical',
              Corridors: 'showCorridors',
              Elevators: 'showElevators'
            }).map(([label, key]) => (
              <label 
                key={key} 
                className="flex items-center gap-2 text-xs cursor-pointer"
                style={{ color: 'var(--text-secondary)' }}
              >
                <input 
                  type="checkbox" 
                  checked={filters[key as keyof typeof filters] as boolean}
                  onChange={() => filters.toggleFilter(key as any)}
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--surface-secondary)',
                    accentColor: 'var(--blue-primary)',
                  }}
                />
                {label}
              </label>
            ))}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
