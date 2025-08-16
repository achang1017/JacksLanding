// frontend/src/layouts/AuthLayout.jsx
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link 
          to="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <FaArrowLeft className="mr-2" />
          Back to Home
        </Link>
        
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">JL</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Jack's Landing</h1>
            <p className="text-gray-600">RV Resort</p>
          </div>
          
          <Outlet />
        </div>
      </div>
    </div>
  );
}