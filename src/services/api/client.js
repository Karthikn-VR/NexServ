const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export const apiClient = async (endpoint, options = {}) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  // include JWT token from localStorage if present
  const token = localStorage.getItem('access_token');

  const headers = {
    ...(options.headers || {}),
  };

  // Only set application/json if not FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    // Debug: Log the full response for troubleshooting
    console.log(`API Response [${response.status} ${response.statusText}]:`, {
      url,
      status: response.status,
      statusText: response.statusText,
      data: data,
      ok: response.ok
    });

    if (!response.ok) {
      // Standardized error handling for our new backend format
      let errorMessage = data.message || 'Request failed';
      let errorDetail = data.detail;

      if (errorDetail) {
        if (typeof errorDetail === 'object') {
          errorMessage = `${errorMessage}: ${JSON.stringify(errorDetail)}`;
        } else {
          errorMessage = `${errorMessage}: ${errorDetail}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
