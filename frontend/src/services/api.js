import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000'),
  timeout: 10000,
});

// Automatically inject JWT tokens into request headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('trimr_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
