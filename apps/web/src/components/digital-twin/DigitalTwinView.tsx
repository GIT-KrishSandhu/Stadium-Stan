'use client';

import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DigitalTwinCanvas } from './DigitalTwinCanvas';
import { OperationalDrawer } from './OperationalDrawer';
import { useGraphStore } from '../../stores/graphStore';
import { api } from '../../services/api';
import { wsClient } from '../../services/ws';
import { useAppStore } from '../../stores/appStore';

export function DigitalTwinView({ compact = false }: { compact?: boolean }) {
  const { venueId } = useAppStore();
  const setGraph = useGraphStore((state) => state.setGraph);

  const { data, isLoading } = useQuery({
    queryKey: ['twin', venueId],
    queryFn: async () => {
      const response = await api.get(`/venues/${venueId}/twin`);
      return response.data;
    }
  });

  useEffect(() => {
    if (data) {
      // Map backend nodes to React Flow nodes
      const rfNodes = data.nodes.map((n: any) => ({
        id: n.id,
        type: ['gate', 'section', 'medical'].includes(n.node_type) ? n.node_type : 'generic',
        position: { x: n.layout_x || 0, y: n.layout_y || 0 },
        data: {
          name: n.name,
          type: n.node_type,
          occupancy: 0, // Will be hydrated by WS
          status: 'normal',
          riskScore: 0.1,
        }
      }));

      // Map backend edges to React Flow edges
      const rfEdges = data.edges.map((e: any) => ({
        id: e.id,
        source: e.source_id,
        target: e.target_id,
        animated: false,
        style: { stroke: '#475569', strokeWidth: 2 },
      }));

      setGraph(rfNodes, rfEdges);
      
      // Connect WebSocket for live updates
      wsClient.connect(venueId);
    }
  }, [data, setGraph, venueId]);

  return (
    <div 
      className="flex h-full w-full relative overflow-hidden rounded-xl border"
      style={{
        borderColor: 'var(--border)',
      }}
    >
      {isLoading ? (
        <div 
          className="flex-1 flex items-center justify-center"
          style={{
            backgroundColor: 'var(--background)',
            color: 'var(--text-secondary)',
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-800 border-t-blue-600"></div>
            Loading Digital Twin...
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 relative h-full min-h-0 min-w-0">
            <DigitalTwinCanvas />
          </div>
          {!compact && <OperationalDrawer />}
        </>
      )}
    </div>
  );
}
