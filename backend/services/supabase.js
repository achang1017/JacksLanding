// backend/services/supabase.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Check if we have the required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('⚠️  Missing Supabase environment variables!');
  console.error('Please check your .env file has SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

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

// Test the connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('lots')
      .select('count');
    
    if (error) throw error;
    
    console.log('✅ Supabase connected successfully!');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
};

export default supabaseAdmin;