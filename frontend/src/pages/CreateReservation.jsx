// frontend/src/pages/CreateReservation.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import apiService from '../services/api.js';
import toast from 'react-hot-toast';
import { FaCalendarAlt, FaUsers, FaCar } from 'react-icons/fa';

export default function CreateReservation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lotId = searchParams.get('lot');
  
  const [lot, setLot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    check_in: '',
    check_out: '',
    guests_count: 1,
    rv_info: {
      make: '',
      model: '',
      length: '',
      license_plate: ''
    },
    special_requests: ''
  });

  useEffect(() => {
    if (lotId) {
      fetchLotDetails();
    } else {
      navigate('/availability');
    }
  }, [lotId]);

  const fetchLotDetails = async () => {
    try {
      const response = await apiService.lots.getOne(lotId);
      setLot(response.data.data);
    } catch (error) {
      toast.error('Failed to load lot details');
      navigate('/availability');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('rv_')) {
      const field = name.replace('rv_', '');
      setFormData(prev => ({
        ...prev,
        rv_info: {
          ...prev.rv_info,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const calculateTotal = () => {
    if (!formData.check_in || !formData.check_out || !lot) return 0;
    
    const checkIn = new Date(formData.check_in);
    const checkOut = new Date(formData.check_out);
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) return 0;
    
    if (days >= 30 && lot.monthly_rate) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      return (months * lot.monthly_rate) + (remainingDays * lot.daily_rate);
    } else if (days >= 7 && lot.weekly_rate) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      return (weeks * lot.weekly_rate) + (remainingDays * lot.daily_rate);
    } else {
      return days * lot.daily_rate;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to make a reservation');
      navigate('/auth/login');
      return;
    }

    setLoading(true);
    
    try {
      const response = await apiService.reservations.create({
        lot_id: lotId,
        ...formData,
        guests_count: parseInt(formData.guests_count)
      });
      
      toast.success(`Reservation confirmed! Confirmation code: ${response.data.data.confirmation_code}`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create reservation');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = calculateTotal();
  const today = new Date().toISOString().split('T')[0];

  if (!lot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Reserve Lot {lot.lot_number}</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Lot Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Lot Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><strong>Size:</strong> {lot.size || 'Standard'}</p>
                <p><strong>Daily Rate:</strong> ${lot.daily_rate}</p>
                <p><strong>Weekly Rate:</strong> ${lot.weekly_rate}</p>
                <p><strong>Monthly Rate:</strong> ${lot.monthly_rate}</p>
              </div>
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in Date *
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="date"
                    name="check_in"
                    value={formData.check_in}
                    onChange={handleChange}
                    min={today}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out Date *
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="date"
                    name="check_out"
                    value={formData.check_out}
                    onChange={handleChange}
                    min={formData.check_in || today}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Guest Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Guests *
              </label>
              <div className="relative">
                <FaUsers className="absolute left-3 top-3 text-gray-400" />
                <select
                  name="guests_count"
                  value={formData.guests_count}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {[1,2,3,4,5,6,7,8].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* RV Information */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3 flex items-center">
                <FaCar className="mr-2" /> RV Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="rv_make"
                  value={formData.rv_info.make}
                  onChange={handleChange}
                  placeholder="Make (e.g., Winnebago)"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <input
                  type="text"
                  name="rv_model"
                  value={formData.rv_info.model}
                  onChange={handleChange}
                  placeholder="Model (e.g., Vista)"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <input
                  type="text"
                  name="rv_length"
                  value={formData.rv_info.length}
                  onChange={handleChange}
                  placeholder="Length (e.g., 35ft)"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <input
                  type="text"
                  name="rv_license_plate"
                  value={formData.rv_info.license_plate}
                  onChange={handleChange}
                  placeholder="License Plate"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requests
              </label>
              <textarea
                name="special_requests"
                value={formData.special_requests}
                onChange={handleChange}
                rows="3"
                placeholder="Any special requests or notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            {/* Pricing Summary */}
            {totalAmount > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Total Cost</h3>
                <p className="text-2xl font-bold text-blue-600">${totalAmount.toFixed(2)}</p>
                <p className="text-sm text-gray-600">
                  For {Math.ceil((new Date(formData.check_out) - new Date(formData.check_in)) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/availability')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.check_in || !formData.check_out}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Reservation...' : 'Confirm Reservation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}