import { create } from 'zustand';

interface VolunteerState {
  status: string;
  currentLocationNodeId: string | null;
  setStatus: (status: string) => void;
  setLocation: (nodeId: string | null) => void;
}

export const useVolunteerStore = create<VolunteerState>((set) => ({
  status: 'available',
  currentLocationNodeId: null,
  setStatus: (status) => set({ status }),
  setLocation: (nodeId) => set({ currentLocationNodeId: nodeId }),
}));