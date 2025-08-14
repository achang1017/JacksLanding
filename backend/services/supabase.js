// backend/services/supabase.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Create Supabase client with service role key for admin operations
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Helper function to get user from token
export const getUserFromToken = async (token) => {
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error) throw error;
    
    // Get user profile with role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) throw profileError;
    
    return { ...user, profile };
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
};

// Helper function to check if user is admin
export const isAdmin = async (userId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return data?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Helper function to check if user is resident
export const isResident = async (userId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return data?.role === 'resident';
  } catch (error) {
    console.error('Error checking resident status:', error);
    return false;
  }
};

export default supabaseAdmin;