// Mock auth client since we don't have a real JWT auth endpoint yet in the backend,
// but the user requested JWT authentication implementation for manager login.
import { api } from './api';
import { useAuthStore } from '../stores/authStore';

export const authApi = {
  login: async (email: string) => {
    // For Sprint 5.1.1, we simulate the login since OAuth is disabled
    // and there's no actual POST /auth/login yet in FastAPI.
    // The spec said: "Current demo users: manager@stadiumstan.demo"
    if (email === 'manager@stadiumstan.demo' || email === 'volunteer1@stadiumstan.demo' || email === 'volunteer@stadiumstan.demo') {
      const fakeToken = `fake-jwt-token-for-${email}`;
      const role = email.includes('manager') ? 'manager' : 'volunteer';
      
      useAuthStore.getState().setAuth(fakeToken, { email, role });
      return { token: fakeToken, role };
    }
    throw new Error('Unauthorized');
  },
  
  logout: () => {
    useAuthStore.getState().logout();
  }
};
