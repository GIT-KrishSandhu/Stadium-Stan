import { create } from 'zustand';

export interface SelectionState {
  selectedNodeId: string | null;
  setSelectedNode: (id: string | null) => void;
  highlightedPath: string[];
  setHighlightedPath: (path: string[]) => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedNodeId: null,
  setSelectedNode: (id) => set({ selectedNodeId: id }),
  highlightedPath: [],
  setHighlightedPath: (path) => set({ highlightedPath: path }),
}));
