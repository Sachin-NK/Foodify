// API Configuration for different environments
export const API_BASE_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_URL || 'https://your-backend-url.onrender.com/api'
  : 'http://127.0.0.1:8000/api';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  credentials: 'include',
};