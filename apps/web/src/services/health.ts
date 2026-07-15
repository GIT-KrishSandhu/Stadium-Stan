import { api } from './api';

export const healthApi = {
  checkBackendHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};
