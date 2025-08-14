// frontend/src/components/NavBar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBars, 
  FaTimes, 
  FaUser, 
  FaSignOutAlt,
  FaChevronDown,
  FaHome,
  FaCalendarAlt,
  FaImages,
  FaPhone,
  FaInfoCircle,
  FaDollarSign,
  FaTachometerAlt,
  FaUserCog
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, isAdmin, isResident } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setDropdownOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: FaHome },
    { name: 'About', path: '/about', icon: FaInfoCircle },
    { name: 'Availability', path: '/availability', icon: FaCalendarAlt },
    { name: 'Pricing', path: '/pricing', icon: FaDollarSign },
    { name: 'Gallery', path: '/gallery', icon: FaImages },
    { name: 'Contact', path: '/contact', icon: FaPhone },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' 
        : 'bg-transparent py-4'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-xl">JL</span>
            </div>
            <div>
              <h1 className={`font-display font-bold text-xl ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}>
                Jack's Landing
              </h1>
              <p className={`text-xs ${
                isScrolled ? 'text-gray-600' : 'text-gray-200'
              }`}>
                RV Resort
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  isActive(link.path)
                    ? isScrolled
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-white/20 text-white'
                    : isScrolled
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isScrolled
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <FaUser className="text-sm" />
                  <span className="font-medium">
                    {profile?.full_name || user.email.split('@')[0]}
                  </span>
                  <FaChevronDown className={`text-xs transition-transform ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 border border-gray-100"
                    >
                      {isAdmin && (
                        <>
                          <Link
                            to="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                          >
                            <FaUserCog />
                            <span>Admin Dashboard</span>
                          </Link>
                          <hr className="my-2" />
                        </>
                      )}
                      
                      {(isResident || isAdmin) && (
                        <>
                          <Link
                            to="/portal"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                          >
                            <FaTachometerAlt />
                            <span>Resident Portal</span>
                          </Link>
                          <hr className="my-2" />
                        </>
                      )}
                      
                      <Link
                        to="/portal/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        <FaUser />
                        <span>Profile Settings</span>
                      </Link>
                      
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <FaSignOutAlt />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className={`px-4 py-2 rounded-md font-medium transition-all ${
                    isScrolled
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/register"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2 rounded-md ${
              isScrolled ? 'text-gray-700' : 'text-white'
            }`}
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-4 pb-4"
            >
              <div className="flex flex-col space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-all ${
                      isActive(link.path)
                        ? 'bg-primary-100 text-primary-700'
                        : isScrolled
                        ? 'text-gray-700 hover:bg-gray-100'
                        : 'text-white/90 hover:bg-white/10'
                    }`}
                  >
                    <link.icon className="text-lg" />
                    <span className="font-medium">{link.name}</span>
                  </Link>
                ))}

                <hr className={`my-2 ${isScrolled ? 'border-gray-200' : 'border-white/20'}`} />

                {user ? (
                  <>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-md ${
                          isScrolled
                            ? 'text-gray-700 hover:bg-gray-100'
                            : 'text-white/90 hover:bg-white/10'
                        }`}
                      >
                        <FaUserCog className="text-lg" />
                        <span className="font-medium">Admin Dashboard</span>
                      </Link>
                    )}
                    
                    {(isResident || isAdmin) && (
                      <Link
                        to="/portal"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-md ${
                          isScrolled
                            ? 'text-gray-700 hover:bg-gray-100'
                            : 'text-white/90 hover:bg-white/10'
                        }`}
                      >
                        <FaTachometerAlt className="text-lg" />
                        <span className="font-medium">Resident Portal</span>
                      </Link>
                    )}
                    
                    <Link
                      to="/portal/settings"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-md ${
                        isScrolled
                          ? 'text-gray-700 hover:bg-gray-100'
                          : 'text-white/90 hover:bg-white/10'
                      }`}
                    >
                      <FaUser className="text-lg" />
                      <span className="font-medium">Profile</span>
                    </Link>
                    
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                      className="flex items-center space-x-3 px-4 py-3 rounded-md text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <FaSignOutAlt className="text-lg" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/auth/login"
                      onClick={() => setIsOpen(false)}
                      className={`px-4 py-3 rounded-md font-medium text-center ${
                        isScrolled
                          ? 'text-gray-700 hover:bg-gray-100'
                          : 'text-white/90 hover:bg-white/10'
                      }`}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/auth/register"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-3 bg-primary-600 text-white rounded-md font-medium text-center hover:bg-primary-700"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default NavBar;