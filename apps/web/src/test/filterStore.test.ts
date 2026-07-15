import { describe, it, expect, beforeEach } from 'vitest';
import { useFilterStore } from '../stores/filterStore';

describe('Filter Store', () => {
  beforeEach(() => {
    useFilterStore.getState().reset();
  });

  it('should initialize with all filters true', () => {
    const state = useFilterStore.getState();
    expect(state.showGates).toBe(true);
    expect(state.showSections).toBe(true);
    expect(state.showMedical).toBe(true);
  });

  it('should toggle specific filter correctly', () => {
    useFilterStore.getState().toggleFilter('showGates');
    expect(useFilterStore.getState().showGates).toBe(false);
    expect(useFilterStore.getState().showSections).toBe(true);
  });
});
