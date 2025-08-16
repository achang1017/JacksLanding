// frontend/src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaWifi, FaShower, FaBolt, FaWater, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

export default function Home() {
  const amenities = [
    { icon: FaWifi, name: 'Free WiFi', description: 'High-speed internet throughout the park' },
    { icon: FaShower, name: 'Clean Restrooms', description: 'Modern facilities with hot showers' },
    { icon: FaBolt, name: '30/50 Amp Service', description: 'Full electrical hookups' },
    { icon: FaWater, name: 'Water & Sewer', description: 'Full hookups at every site' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px] bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Welcome to Jack's Landing
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Your Perfect RV Destination in Grants Pass, Oregon
            </p>
            <div className="space-x-4">
              <Link
                to="/availability"
                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Check Availability
              </Link>
              <Link
                to="/contact"
                className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Jack's Landing?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMapMarkerAlt className="text-blue-600 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Prime Location</h3>
              <p className="text-gray-600">
                Nestled in the heart of Grants Pass with easy access to local attractions and the Rogue River.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaWater className="text-green-600 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Full Hookups</h3>
              <p className="text-gray-600">
                Every site features full hookups including water, sewer, and 30/50 amp electrical service.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaWifi className="text-purple-600 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Modern Amenities</h3>
              <p className="text-gray-600">
                Enjoy free high-speed WiFi, clean facilities, and all the comforts of home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Park Amenities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {amenities.map((amenity, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <amenity.icon className="text-blue-600 text-3xl mb-4" />
                <h3 className="text-lg font-semibold mb-2">{amenity.name}</h3>
                <p className="text-gray-600 text-sm">{amenity.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Reserve Your Spot?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Experience the best of RV living at Jack's Landing. Book your stay today!
          </p>
          <div className="space-x-4">
            <Link
              to="/availability"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              View Available Lots
            </Link>
            <Link
              to="/auth/register"
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Get In Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <FaMapMarkerAlt className="text-blue-600 text-3xl mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Location</h3>
              <p className="text-gray-600">
                Grants Pass, Oregon<br />
                97526
              </p>
            </div>
            <div>
              <FaPhone className="text-blue-600 text-3xl mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Phone</h3>
              <p className="text-gray-600">
                (555) 123-4567<br />
                Mon-Fri 9AM-5PM
              </p>
            </div>
            <div>
              <FaEnvelope className="text-blue-600 text-3xl mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-gray-600">
                info@jackslandingrv.com<br />
                24/7 Support
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}