// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { FaUser, FaCalendarAlt, FaDollarSign, FaHome } from 'react-icons/fa';

export default function Dashboard() {
  const { user, profile, isAdmin, isResident } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [charges, setCharges] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [loadingCharges, setLoadingCharges] = useState(false);

  useEffect(() => {
    fetchReservations();
    if (isResident) {
      fetchCharges();
    }
  }, [isResident]);

  const fetchReservations = async () => {
    try {
      const response = await apiService.reservations.getMine();
      setReservations(response.data.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoadingReservations(false);
    }
  };

  const fetchCharges = async () => {
    setLoadingCharges(true);
    try {
      const response = await apiService.charges.getMine();
      setCharges(response.data.data);
    } catch (error) {
      console.error('Error fetching charges:', error);
    } finally {
      setLoadingCharges(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold mb-4">Welcome back, {profile?.full_name || user?.email}!</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <FaUser className="text-blue-600 text-xl" />
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-semibold capitalize">{profile?.role || 'Guest'}</p>
              </div>
            </div>
            {isResident && (
              <div className="flex items-center space-x-3">
                <FaHome className="text-green-600 text-xl" />
                <div>
                  <p className="text-sm text-gray-600">Lot Number</p>
                  <p className="font-semibold">{profile?.lot_number || 'Not Assigned'}</p>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <FaCalendarAlt className="text-purple-600 text-xl" />
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-semibold">
                  {new Date(user?.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reservations Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Reservations</h2>
          {loadingReservations ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : reservations.length === 0 ? (
            <p className="text-gray-600">You don't have any reservations yet.</p>
          ) : (
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">
                        Lot {reservation.lot?.lot_number || 'N/A'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Check-in: {new Date(reservation.check_in).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Check-out: {new Date(reservation.check_out).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Confirmation: {reservation.confirmation_code}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                        {reservation.status}
                      </span>
                      <p className="mt-2 font-semibold">${reservation.total_amount}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Charges Section (Residents Only) */}
        {isResident && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Monthly Charges</h2>
            {loadingCharges ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : charges.length === 0 ? (
              <p className="text-gray-600">No charges at this time.</p>
            ) : (
              <div className="space-y-4">
                {charges.map((charge) => (
                  <div key={charge.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold capitalize">
                          {charge.charge_type.replace('_', ' ')}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {charge.description}
                        </p>
                        <p className="text-sm text-gray-600">
                          Due: {charge.due_date ? new Date(charge.due_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          charge.payment_status === 'paid' 
                            ? 'bg-green-100 text-green-800'
                            : charge.payment_status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {charge.payment_status}
                        </span>
                        <p className="mt-2 font-semibold">${charge.amount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Admin Quick Links */}
        {isAdmin && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
            <h2 className="text-xl font-semibold mb-4">Admin Quick Links</h2>
            <p className="text-gray-700">
              As an admin, you have access to additional features. 
              Full admin dashboard coming soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}