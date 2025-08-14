// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Layout Components
import MainLayout from './layouts/MainLayout';
import PortalLayout from './layouts/PortalLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Availability from './pages/Availability';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Portal Pages
import Dashboard from './portal/Dashboard';
import MyReservations from './portal/MyReservations';
import MyCharges from './portal/MyCharges';
import MyPayments from './portal/MyPayments';
import ProfileSettings from './portal/ProfileSettings';

// Admin Pages
import AdminDashboard from './admin/Dashboard';
import AdminLots from './admin/Lots';
import AdminReservations from './admin/Reservations';
import AdminResidents from './admin/Residents';
import AdminCharges from './admin/Charges';
import AdminInquiries from './admin/Inquiries';
import AdminSettings from './admin/Settings';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

// Styles
import './styles/globals.css';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="availability" element={<Availability />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="contact" element={<Contact />} />
            </Route>
            
            {/* Auth Routes */}
            <Route path="/auth">
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
            </Route>
            
            {/* Resident Portal Routes */}
            <Route
              path="/portal"
              element={
                <ProtectedRoute>
                  <PortalLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="reservations" element={<MyReservations />} />
              <Route path="charges" element={<MyCharges />} />
              <Route path="payments" element={<MyPayments />} />
              <Route path="settings" element={<ProfileSettings />} />
            </Route>
            
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="lots" element={<AdminLots />} />
              <Route path="reservations" element={<AdminReservations />} />
              <Route path="residents" element={<AdminResidents />} />
              <Route path="charges" element={<AdminCharges />} />
              <Route path="inquiries" element={<AdminInquiries />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}


export default App;