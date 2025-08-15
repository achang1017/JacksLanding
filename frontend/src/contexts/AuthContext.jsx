// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import apiService from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from backend
  const fetchProfile = async () => {
    try {
      const response = await apiService.auth.getProfile();
      if (response.data.success) {
        setProfile(response.data.data.profile);
        return response.data.data.profile;
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          await fetchProfile();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        await fetchProfile();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Sign up
  const signUp = async (email, password, fullName, phone) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone
          }
        }
      });

      if (error) throw error;

      toast.success('Registration successful! Please check your email to verify your account.');
      return { data, error: null };
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Sign in
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        await fetchProfile();
      }

      toast.success('Welcome back!');
      return { data, error: null };
    } catch (error) {
      toast.error(error.message || 'Sign in failed');
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Signed out successfully');
      return { error: null };
    } catch (error) {
      toast.error(error.message || 'Sign out failed');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    isResident: profile?.role === 'resident',
    signUp,
    signIn,
    signOut,
    fetchProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};