// frontend/src/App.jsx
import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import apiService from './services/api';

// Simple Login Component
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signIn(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}

// Main Dashboard Component
function Dashboard() {
  const { user, profile, signOut, isAdmin, isResident } = useAuth();
  const [lots, setLots] = useState([]);
  const [loadingLots, setLoadingLots] = useState(false);

  const fetchLots = async () => {
    setLoadingLots(true);
    try {
      const response = await apiService.lots.getAll();
      setLots(response.data.data);
    } catch (error) {
      console.error('Error fetching lots:', error);
    } finally {
      setLoadingLots(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Welcome, {profile?.full_name || user?.email}!</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">{profile?.role || 'guest'}</span></p>
          {isResident && <p><strong>Lot:</strong> {profile?.lot_number}</p>}
        </div>
        <button
          onClick={signOut}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Available Lots</h3>
          <button
            onClick={fetchLots}
            disabled={loadingLots}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loadingLots ? 'Loading...' : 'Fetch Lots'}
          </button>
        </div>
        
        {lots.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lots.map(lot => (
              <div key={lot.id} className="border rounded-lg p-4">
                <h4 className="font-semibold">Lot {lot.lot_number}</h4>
                <p className="text-sm text-gray-600">Size: {lot.size}</p>
                <p className="text-sm text-gray-600">Monthly: ${lot.monthly_rate}</p>
                <p className="text-sm text-gray-600">Status: {lot.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-yellow-800">🔑 You have admin access!</p>
        </div>
      )}

      {isResident && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <p className="text-green-800">🏠 You are a resident of lot {profile?.lot_number}</p>
        </div>
      )}
    </div>
  );
}

// Main App Component
function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Jack's Landing RV Resort</h1>
        
        {user ? (
          <Dashboard />
        ) : (
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Sign In</h2>
            <LoginForm />
            <p className="mt-4 text-sm text-gray-600 text-center">
              Test Email: Use any email you registered in backend tests
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <AppContent />
    </AuthProvider>
  );
}