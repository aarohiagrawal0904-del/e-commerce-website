import axios from 'axios';

// Create custom Axios instance
const api = axios.create({
  baseURL: '', // Empty base because we rely on Vite proxy mapping in development
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to dynamically inject the JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to format errors nicely
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract error message from Express error handler
    const message =
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : error.message || 'Something went wrong';
    
    // Customize error object with our descriptive message
    error.customMessage = message;
    
    // Automatically wipe session if token becomes invalid/expired (401 Unauthorized)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // We can also trigger a window event or let contexts handle it
    }
    
    return Promise.reject(error);
  }
);

export default api;
