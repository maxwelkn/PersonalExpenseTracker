import axios from 'axios';
import toast from 'react-hot-toast';

export const API_BASE_URL = 'http://localhost:5211/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        const data = error.response.data;
        const message = data?.detail || data?.message || data?.title || 'An error occurred';
        
        // Don't toast 404s globally if they are expected, but for now we toast all errors
        if (error.response.status !== 404) {
            toast.error(message);
        }
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error(error.message);
    }
    return Promise.reject(error);
  }
);
