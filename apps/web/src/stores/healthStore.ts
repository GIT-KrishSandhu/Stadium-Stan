import { create } from 'zustand';

type ConnectionStatus = 'Connected' | 'Degraded' | 'Disconnected' | 'Unknown';

interface HealthState {
  api: ConnectionStatus;
  database: ConnectionStatus;
  redis: ConnectionStatus;
  agent: ConnectionStatus;
  websocket: ConnectionStatus;
  lastChecked: Date | null;
  setServiceStatus: (service: keyof Omit<HealthState, 'setServiceStatus' | 'lastChecked'>, status: ConnectionStatus) => void;
  updateAll: (status: Partial<Omit<HealthState, 'setServiceStatus' | 'updateAll'>>) => void;
}

export const useHealthStore = create<HealthState>((set) => ({
  api: 'Unknown',
  database: 'Unknown',
  redis: 'Unknown',
  agent: 'Unknown',
  websocket: 'Unknown',
  lastChecked: null,
  setServiceStatus: (service, status) => 
    set((state) => ({ ...state, [service]: status, lastChecked: new Date() })),
  updateAll: (status) => 
    set((state) => ({ ...state, ...status, lastChecked: new Date() })),
}));
