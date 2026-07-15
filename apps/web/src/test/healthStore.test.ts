import { describe, it, expect } from 'vitest';
import { useHealthStore } from '../stores/healthStore';

describe('Health Store', () => {
  it('should initialize with Unknown status', () => {
    const state = useHealthStore.getState();
    expect(state.api).toBe('Unknown');
    expect(state.database).toBe('Unknown');
    expect(state.redis).toBe('Unknown');
  });

  it('should update single service status', () => {
    useHealthStore.getState().setServiceStatus('api', 'Connected');
    expect(useHealthStore.getState().api).toBe('Connected');
    expect(useHealthStore.getState().lastChecked).toBeInstanceOf(Date);
  });

  it('should update multiple services at once', () => {
    useHealthStore.getState().updateAll({
      api: 'Connected',
      database: 'Degraded'
    });
    const state = useHealthStore.getState();
    expect(state.api).toBe('Connected');
    expect(state.database).toBe('Degraded');
    expect(state.redis).toBe('Unknown'); // unchanged
  });
});
