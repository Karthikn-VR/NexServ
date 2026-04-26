import { apiClient } from './client';

export const authAPI = {
  register: (name, email, password, role) => {
    return apiClient('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role: role || 'customer' }),
    });
  },

  login: async (email, password) => {
    const response = await apiClient('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Debug: Log the exact response from backend
    console.log('Backend login response:', JSON.stringify(response, null, 2));
    
    return response;
  },

  me: () => {
    return apiClient('/api/auth/me', {
      method: 'GET',
    });
  },
};
