import { describe, it, expect, beforeEach } from 'vitest';
import { useGraphStore } from '../stores/graphStore';

describe('Graph Store', () => {
  beforeEach(() => {
    useGraphStore.setState({ nodes: [], edges: [], isLoaded: false });
  });

  it('should set graph data correctly', () => {
    const mockNodes = [{ id: '1', position: { x: 0, y: 0 }, data: { name: 'Node 1', type: 'gate', occupancy: 0, status: 'normal' } }];
    const mockEdges = [{ id: 'e1', source: '1', target: '2' }];
    
    useGraphStore.getState().setGraph(mockNodes, mockEdges);
    
    const state = useGraphStore.getState();
    expect(state.nodes).toHaveLength(1);
    expect(state.edges).toHaveLength(1);
    expect(state.isLoaded).toBe(true);
  });

  it('should update specific node data correctly', () => {
    const mockNodes = [
      { id: '1', position: { x: 0, y: 0 }, data: { name: 'Gate A', type: 'gate', occupancy: 0, status: 'normal' } },
      { id: '2', position: { x: 10, y: 10 }, data: { name: 'Gate B', type: 'gate', occupancy: 10, status: 'closed' } }
    ];
    useGraphStore.getState().setGraph(mockNodes, []);
    
    useGraphStore.getState().updateNodeData('1', { occupancy: 50, riskScore: 0.8 });
    
    const state = useGraphStore.getState();
    expect(state.nodes[0].data.occupancy).toBe(50);
    expect(state.nodes[0].data.riskScore).toBe(0.8);
    // Ensure others are not mutated
    expect(state.nodes[1].data.occupancy).toBe(10);
  });
});
