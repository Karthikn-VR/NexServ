import { apiClient } from './client';

export const menuAPI = {
  getMenu: () => {
    return apiClient('/api/dishes/');
  },
  createDish: (dishData) => {
    return apiClient('/api/dishes/', {
      method: 'POST',
      body: JSON.stringify(dishData),
    });
  },
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient('/api/dishes/upload', {
      method: 'POST',
      body: formData,
      // Note: apiClient needs to handle FormData correctly (not setting Content-Type to application/json)
      headers: {}, 
    });
  },
};
