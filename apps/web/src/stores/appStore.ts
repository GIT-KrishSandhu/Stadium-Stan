import { create } from 'zustand';

interface AppState {
  currentEvent: string;
  currentVenue: string;
  venueId: string;
  sidebarOpen: boolean;
  setCurrentEvent: (event: string) => void;
  setCurrentVenue: (venue: string) => void;
  setVenueId: (id: string) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentEvent: 'Global Event',
  currentVenue: 'Primary Venue',
  venueId: 'metlife',
  sidebarOpen: true,
  setCurrentEvent: (event) => set({ currentEvent: event }),
  setCurrentVenue: (venue) => set({ currentVenue: venue }),
  setVenueId: (id) => set({ venueId: id }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
