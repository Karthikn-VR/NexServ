import { apiClient } from './client';

export const deliveryAPI = {
  assignDelivery: (orderId, deliveryPartnerId) => {
    return apiClient(`/api/delivery/assign/${orderId}`, {
      method: 'POST',
      body: JSON.stringify({ deliveryPartnerId }),
    });
  },
};
