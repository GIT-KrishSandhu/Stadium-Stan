import { create } from 'zustand';

interface WebSocketState {
  isConnected: boolean;
  lastMessageTime: Date | null;
  reconnectAttempts: number;
  setConnected: (status: boolean) => void;
  recordMessage: () => void;
  incrementReconnect: () => void;
  resetReconnect: () => void;
}

export const useWebSocketStore = create<WebSocketState>((set) => ({
  isConnected: false,
  lastMessageTime: null,
  reconnectAttempts: 0,
  setConnected: (status) => set({ isConnected: status }),
  recordMessage: () => set({ lastMessageTime: new Date() }),
  incrementReconnect: () => set((state) => ({ reconnectAttempts: state.reconnectAttempts + 1 })),
  resetReconnect: () => set({ reconnectAttempts: 0 }),
}));
