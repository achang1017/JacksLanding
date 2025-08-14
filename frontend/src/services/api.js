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
    getAll: (params) => api.get('/lots', { params }),
    getAvailability: (checkIn, checkOut) => 
      api.get('/lots/availability', { params: { check_in: checkIn, check_out: checkOut } }),
    getOne: (id) => api.get(`/lots/${id}`),
    create: (data) => api.post('/lots', data),
    update: (id, data) => api.put(`/lots/${id}`, data),
    delete: (id) => api.delete(`/lots/${id}`),
  },

  // Reservations
  reservations: {
    getMine: (params) => api.get('/reservations/my-reservations', { params }),
    getAll: (params) => api.get('/reservations', { params }),
    getOne: (id) => api.get(`/reservations/${id}`),
    create: (data) => api.post('/reservations', data),
    updateStatus: (id, status) => api.patch(`/reservations/${id}/status`, { status }),
    cancel: (id) => api.delete(`/reservations/${id}`),
  },

  // Charges
  charges: {
    getMine: (params) => api.get('/charges/my-charges', { params }),
    getAll: (params) => api.get('/charges', { params }),
    getOne: (id) => api.get(`/charges/${id}`),
    create: (data) => api.post('/charges', data),
    createBulkMonthly: (month, year) => api.post('/charges/bulk-monthly', { month, year }),
    update: (id, data) => api.put(`/charges/${id}`, data),
    markPaid: (id, paymentMethod, notes) => 
      api.patch(`/charges/${id}/mark-paid`, { payment_method: paymentMethod, notes }),
    delete: (id) => api.delete(`/charges/${id}`),
  },

  // Payments
  payments: {
    getMine: (params) => api.get('/payments/my-payments', { params }),
    getAll: (params) => api.get('/payments', { params }),
    getOne: (id) => api.get(`/payments/${id}`),
    create: (data) => api.post('/payments', data),
  },

  // Inquiries
  inquiries: {
    submit: (data) => api.post('/inquiries', data),
    getAll: (params) => api.get('/inquiries', { params }),
    getOne: (id) => api.get(`/inquiries/${id}`),
    respond: (id, responseNotes) => api.patch(`/inquiries/${id}/respond`, { response_notes: responseNotes }),
    delete: (id) => api.delete(`/inquiries/${id}`),
  },

  // Admin
  admin: {
    // Dashboard stats
    getStats: () => api.get('/admin/stats'),
    
    // User management
    getUsers: (params) => api.get('/admin/users', { params }),
    getUser: (id) => api.get(`/admin/users/${id}`),
    updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
    
    // Reports
    getRevenueReport: (startDate, endDate) => 
      api.get('/admin/reports/revenue', { params: { start_date: startDate, end_date: endDate } }),
    getOccupancyReport: (month, year) => 
      api.get('/admin/reports/occupancy', { params: { month, year } }),
  },

  // Stripe
  stripe: {
    createCheckoutSession: (data) => api.post('/stripe/create-checkout-session', data),
    createPaymentIntent: (data) => api.post('/stripe/create-payment-intent', data),
    confirmPayment: (paymentIntentId) => api.post('/stripe/confirm-payment', { payment_intent_id: paymentIntentId }),
  },

  // Auth (additional endpoints if needed)
  auth: {
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (currentPassword, newPassword) => 
      api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword }),
  },
};

export default apiService;