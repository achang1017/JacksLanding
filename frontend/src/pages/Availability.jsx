// frontend/src/pages/Availability.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import apiService from '../services/api.js';
import { FaBolt, FaWater, FaCheck } from 'react-icons/fa';

export default function Availability() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
      const response = await apiService.lots.getAll();
      setLots(response.data.data);
    } catch (error) {
      console.error('Error fetching lots:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLots = lots.filter(lot => {
    if (filter === 'all') return true;
    return lot.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleReserveClick = (lotId) => {
    if (user) {
      navigate(`/reserve?lot=${lotId}`);
    } else {
      navigate('/auth/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Check Availability</h1>
        
        {/* Filter Buttons */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Lots ({lots.length})
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'available' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Available ({lots.filter(l => l.status === 'available').length})
          </button>
          <button
            onClick={() => setFilter('occupied')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'occupied' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Occupied ({lots.filter(l => l.status === 'occupied').length})
          </button>
        </div>

        {/* Lots Grid */}
        {filteredLots.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No lots found matching your filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLots.map((lot) => (
              <div key={lot.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">Lot {lot.lot_number}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lot.status)}`}>
                      {lot.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><strong>Size:</strong> {lot.size || 'Standard'}</p>
                    <p><strong>Daily:</strong> ${lot.daily_rate || 'N/A'}</p>
                    <p><strong>Weekly:</strong> ${lot.weekly_rate || 'N/A'}</p>
                    <p><strong>Monthly:</strong> ${lot.monthly_rate || 'N/A'}</p>
                  </div>
                  
                  {lot.hookups && lot.hookups.length > 0 && (
                    <div className="mb-4">
                      <p className="font-medium text-sm mb-2">Hookups:</p>
                      <div className="flex flex-wrap gap-2">
                        {lot.hookups.includes('electric') && (
                          <span className="inline-flex items-center text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            <FaBolt className="mr-1" /> Electric
                          </span>
                        )}
                        {lot.hookups.includes('water') && (
                          <span className="inline-flex items-center text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            <FaWater className="mr-1" /> Water
                          </span>
                        )}
                        {lot.hookups.includes('sewer') && (
                          <span className="inline-flex items-center text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            <FaCheck className="mr-1" /> Sewer
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {lot.status === 'available' ? (
                    <button
                      onClick={() => handleReserveClick(lot.id)}
                      className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      {user ? 'Reserve This Lot' : 'Sign In to Reserve'}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="block w-full text-center bg-gray-300 text-gray-500 py-2 rounded-lg cursor-not-allowed"
                    >
                      Not Available
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}