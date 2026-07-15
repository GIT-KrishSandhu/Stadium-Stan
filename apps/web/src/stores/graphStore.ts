import { create } from 'zustand';
import { Node as ReactFlowNode, Edge as ReactFlowEdge } from '@xyflow/react';

export interface NodeData {
  name: string;
  type: string;
  occupancy: number;
  status: string;
  riskScore?: number;
  incidentSeverity?: string;
  [key: string]: unknown;
}

export interface GraphState {
  nodes: ReactFlowNode<NodeData>[];
  edges: ReactFlowEdge[];
  isLoaded: boolean;
  setGraph: (nodes: ReactFlowNode<NodeData>[], edges: ReactFlowEdge[]) => void;
  updateNodeData: (nodeId: string, partialData: Partial<NodeData>) => void;
}

export const useGraphStore = create<GraphState>((set) => ({
  nodes: [],
  edges: [],
  isLoaded: false,
  setGraph: (nodes, edges) => set({ nodes, edges, isLoaded: true }),
  updateNodeData: (nodeId, partialData) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...partialData } }
          : node
      ),
    })),
}));
