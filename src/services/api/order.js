import { apiClient } from './client';

export const orderAPI = {
  placeOrder: (orderData) => {
    return apiClient('/api/orders/', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  getOrders: () => {
    return apiClient('/api/orders/my');
  },

  getVendorOrders: () => apiClient('/api/orders/vendor'),
  approveOrder: (orderId) => apiClient(`/api/orders/${orderId}/approve`, { method: 'POST' }),
  rejectOrder: (orderId, reason) => apiClient(`/api/orders/${orderId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }),
  outOfStock: (orderId) => apiClient(`/api/orders/${orderId}/out-of-stock`, { method: 'POST' }),
  assignDelivery: (orderId) => apiClient(`/api/orders/${orderId}/assign`, { method: 'POST' }),
  getTracking: (orderId) => apiClient(`/api/orders/${orderId}/tracking`),
  assignExternal: (order) => apiClient('/api/orders/assign-external', {
    method: 'POST',
    body: JSON.stringify({ order }),
  }),
};
