import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../stores/authStore';

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.getState().logout();
  });

  it('should start with null token', () => {
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('should set auth data correctly', () => {
    const user = { email: 'manager@demo.com', role: 'manager' as const };
    useAuthStore.getState().setAuth('test-token', user);
    
    expect(useAuthStore.getState().token).toBe('test-token');
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it('should clear auth data on logout', () => {
    useAuthStore.getState().setAuth('test-token', { email: 'm@demo.com', role: 'manager' });
    useAuthStore.getState().logout();
    
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });
});
