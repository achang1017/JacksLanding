// frontend/src/services/api.js
import axios from 'axios';
import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, sign out
      supabase.auth.signOut();
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// API methods
const apiService = {
  // Lots
  lots: {
    getAll: () => api.get('/lots'),
    getOne: (id) => api.get(`/lots/${id}`),
  },

  // Reservations
  reservations: {
    getMine: () => api.get('/reservations/my-reservations'),
    create: (data) => api.post('/reservations', data),
    updateStatus: (id, status) => api.patch(`/reservations/${id}/status`, { status }),
    cancel: (id) => api.delete(`/reservations/${id}`),
  },

  // Charges
  charges: {
    getMine: () => api.get('/charges/my-charges'),
  },

  // Inquiries
  inquiries: {
    submit: (data) => api.post('/inquiries', data),
  },

  // Auth
  auth: {
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
  },
};

export default apiService;