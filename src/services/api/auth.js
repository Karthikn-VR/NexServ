import { apiClient } from './client';

export const authAPI = {
  register: (name, email, password, role) => {
    return apiClient('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role: role || 'customer' }),
    });
  },

  login: (email, password) => {
    return apiClient('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  me: () => {
    return apiClient('/api/auth/me', {
      method: 'GET',
    });
  },
};
