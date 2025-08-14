// frontend/src/services/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper functions for common operations

// Lots
export const getLots = async (filters = {}) => {
  let query = supabase.from('lots').select('*');
  
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters.minPrice) {
    query = query.gte('monthly_rate', filters.minPrice);
  }
  
  if (filters.maxPrice) {
    query = query.lte('monthly_rate', filters.maxPrice);
  }
  
  return query.order('lot_number');
};

export const getLot = async (id) => {
  return supabase
    .from('lots')
    .select(`
      *,
      current_resident:profiles!lots_current_resident_id_fkey(
        id,
        full_name,
        email
      )
    `)
    .eq('id', id)
    .single();
};

// Reservations
export const getMyReservations = async (userId) => {
  return supabase
    .from('reservations')
    .select(`
      *,
      lot:lots(
        lot_number,
        size,
        hookups,
        amenities
      )
    `)
    .eq('user_id', userId)
    .order('check_in', { ascending: false });
};

export const createReservation = async (reservationData) => {
  return supabase
    .from('reservations')
    .insert(reservationData)
    .select()
    .single();
};

export const updateReservation = async (id, updates) => {
  return supabase
    .from('reservations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
};

export const cancelReservation = async (id) => {
  return supabase
    .from('reservations')
    .update({ status: 'cancelled' })
    .eq('id', id);
};

// Charges (for residents)
export const getMyCharges = async (userId) => {
  return supabase
    .from('charges')
    .select(`
      *,
      lot:lots(
        lot_number
      )
    `)
    .eq('resident_id', userId)
    .order('created_at', { ascending: false });
};

// Payments
export const getMyPayments = async (userId) => {
  return supabase
    .from('payments')
    .select(`
      *,
      charge:charges(
        charge_type,
        description,
        amount
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
};

// Announcements
export const getAnnouncements = async () => {
  return supabase
    .from('announcements')
    .select('*')
    .eq('active', true)
    .or('expires_at.is.null,expires_at.gt.now()')
    .order('created_at', { ascending: false });
};

// Amenities
export const getAmenities = async () => {
  return supabase
    .from('amenities')
    .select('*')
    .eq('available', true)
    .order('category', { ascending: true });
};

// Gallery
export const getGalleryImages = async (category = null) => {
  let query = supabase
    .from('gallery')
    .select('*')
    .eq('active', true);
  
  if (category) {
    query = query.eq('category', category);
  }
  
  return query.order('display_order', { ascending: true });
};

// Inquiries
export const submitInquiry = async (inquiryData) => {
  return supabase
    .from('inquiries')
    .insert(inquiryData)
    .select()
    .single();
};

// Real-time subscriptions
export const subscribeToAnnouncements = (callback) => {
  return supabase
    .channel('announcements')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'announcements' 
      }, 
      callback
    )
    .subscribe();
};

export const subscribeToReservations = (userId, callback) => {
  return supabase
    .channel(`reservations:${userId}`)
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'reservations',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
};

export const subscribeToCharges = (userId, callback) => {
  return supabase
    .channel(`charges:${userId}`)
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'charges',
        filter: `resident_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
};