import { create } from 'zustand';

export interface FilterState {
  showGates: boolean;
  showSections: boolean;
  showMedical: boolean;
  showCorridors: boolean;
  showElevators: boolean;
  toggleFilter: (filter: keyof Omit<FilterState, 'toggleFilter' | 'reset'>) => void;
  reset: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  showGates: true,
  showSections: true,
  showMedical: true,
  showCorridors: true,
  showElevators: true,
  toggleFilter: (filter) => set((state) => ({ [filter]: !state[filter] })),
  reset: () => set({
    showGates: true,
    showSections: true,
    showMedical: true,
    showCorridors: true,
    showElevators: true,
  }),
}));
