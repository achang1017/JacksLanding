// backend/routes/reservations.routes.js
import express from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { createPaymentIntent, cancelPaymentIntent } from '../services/stripe.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Generate confirmation code
const generateConfirmationCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Calculate total amount for reservation
const calculateTotal = (checkIn, checkOut, dailyRate, weeklyRate, monthlyRate) => {
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  if (days >= 30 && monthlyRate) {
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    return (months * monthlyRate) + (remainingDays * dailyRate);
  } else if (days >= 7 && weeklyRate) {
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    return (weeks * weeklyRate) + (remainingDays * dailyRate);
  } else {
    return days * dailyRate;
  }
};

// Get user's reservations
router.get('/my-reservations', asyncHandler(async (req, res) => {
  const { status, upcoming } = req.query;
  const userId = req.userId;
  
  let query = supabaseAdmin
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
    .eq('user_id', userId);
  
  if (status) {
    query = query.eq('status', status);
  }
  
  if (upcoming === 'true') {
    query = query.gte('check_in', new Date().toISOString());
  }
  
  const { data, error } = await query.order('check_in', { ascending: false });
  
  if (error) throw error;
  
  res.json({
    success: true,
    data,
    count: data.length
  });
}));

// Get all reservations (admin only)
router.get('/', requireAdmin, asyncHandler(async (req, res) => {
  const { status, lot_id, user_id, from_date, to_date } = req.query;
  
  let query = supabaseAdmin
    .from('reservations')
    .select(`
      *,
      user:profiles(
        full_name,
        email,
        phone
      ),
      lot:lots(
        lot_number,
        size
      )
    `);
  
  if (status) {
    query = query.eq('status', status);
  }
  
  if (lot_id) {
    query = query.eq('lot_id', lot_id);
  }
  
  if (user_id) {
    query = query.eq('user_id', user_id);
  }
  
  if (from_date) {
    query = query.gte('check_in', from_date);
  }
  
  if (to_date) {
    query = query.lte('check_out', to_date);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  
  res.json({
    success: true,
    data,
    count: data.length
  });
}));

// Get single reservation
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const isUserAdmin = await requireAdmin(userId);
  
  let query = supabaseAdmin
    .from('reservations')
    .select(`
      *,
      user:profiles(
        full_name,
        email,
        phone
      ),
      lot:lots(
        lot_number,
        size,
        hookups,
        amenities,
        images
      )
    `)
    .eq('id', id);
  
  // Non-admins can only view their own reservations
  if (!isUserAdmin) {
    query = query.eq('user_id', userId);
  }
  
  const { data, error } = await query.single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Reservation not found'
      });
    }
    throw error;
  }
  
  res.json({
    success: true,
    data
  });
}));

// Create new reservation
router.post('/', asyncHandler(async (req, res) => {
  const userId = req.userId;
  const {
    lot_id,
    check_in,
    check_out,
    guests_count,
    rv_info,
    special_requests
  } = req.body;
  
  // Validate required fields
  if (!lot_id || !check_in || !check_out) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'lot_id, check_in, and check_out are required'
    });
  }
  
  // Check if lot is available for the dates
  const { data: existingReservations, error: checkError } = await supabaseAdmin
    .from('reservations')
    .select('id')
    .eq('lot_id', lot_id)
    .or(`check_in.lte.${check_out},check_out.gte.${check_in}`)
    .in('status', ['confirmed', 'pending']);
  
  if (checkError) throw checkError;
  
  if (existingReservations && existingReservations.length > 0) {
    return res.status(409).json({
      error: 'Conflict',
      message: 'Lot is not available for the selected dates'
    });
  }
  
  // Get lot details for pricing
  const { data: lot, error: lotError } = await supabaseAdmin
    .from('lots')
    .select('daily_rate, weekly_rate, monthly_rate')
    .eq('id', lot_id)
    .single();
  
  if (lotError) throw lotError;
  
  // Calculate total amount
  const totalAmount = calculateTotal(
    check_in,
    check_out,
    lot.daily_rate,
    lot.weekly_rate,
    lot.monthly_rate
  );
  
  // Get user's Stripe customer ID
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('stripe_customer_id, email, full_name')
    .eq('id', userId)
    .single();
  
  if (profileError) throw profileError;
  
  // Create payment intent
  let paymentIntent = null;
  if (profile.stripe_customer_id) {
    paymentIntent = await createPaymentIntent(
      totalAmount,
      profile.stripe_customer_id,
      {
        reservation_type: 'new',
        lot_id,
        check_in,
        check_out
      }
    );
  }
  
  // Create reservation
  const { data: reservation, error: reservationError } = await supabaseAdmin
    .from('reservations')
    .insert({
      user_id: userId,
      lot_id,
      check_in,
      check_out,
      guests_count: guests_count || 1,
      rv_info,
      special_requests,
      total_amount: totalAmount,
      confirmation_code: generateConfirmationCode(),
      status: 'pending',
      stripe_payment_intent_id: paymentIntent?.id
    })
    .select()
    .single();
  
  if (reservationError) throw reservationError;
  
  res.status(201).json({
    success: true,
    data: reservation,
    payment: paymentIntent ? {
      client_secret: paymentIntent.client_secret,
      amount: totalAmount
    } : null,
    message: 'Reservation created successfully'
  });
}));

// Update reservation status
router.patch('/:id/status', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.userId;
  const isUserAdmin = await requireAdmin(userId);
  
  if (!status) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Status is required'
    });
  }
  
  // Validate status
  const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid status'
    });
  }
  
  // Get reservation
  let query = supabaseAdmin
    .from('reservations')
    .select('*, user_id, stripe_payment_intent_id')
    .eq('id', id);
  
  if (!isUserAdmin) {
    query = query.eq('user_id', userId);
  }
  
  const { data: reservation, error: getError } = await query.single();
  
  if (getError) {
    if (getError.code === 'PGRST116') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Reservation not found'
      });
    }
    throw getError;
  }
  
  // Handle cancellation
  if (status === 'cancelled' && reservation.stripe_payment_intent_id) {
    try {
      await cancelPaymentIntent(reservation.stripe_payment_intent_id);
    } catch (stripeError) {
      console.error('Error canceling payment intent:', stripeError);
    }
  }
  
  // Update reservation
  const { data, error } = await supabaseAdmin
    .from('reservations')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  res.json({
    success: true,
    data,
    message: `Reservation ${status} successfully`
  });
}));

// Cancel reservation
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  
  // Get reservation
  const { data: reservation, error: getError } = await supabaseAdmin
    .from('reservations')
    .select('*, user_id, stripe_payment_intent_id')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  
  if (getError) {
    if (getError.code === 'PGRST116') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Reservation not found'
      });
    }
    throw getError;
  }
  
  // Check if reservation can be cancelled
  if (reservation.status === 'completed') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Cannot cancel completed reservation'
    });
  }
  
  // Cancel payment intent if exists
  if (reservation.stripe_payment_intent_id) {
    try {
      await cancelPaymentIntent(reservation.stripe_payment_intent_id);
    } catch (stripeError) {
      console.error('Error canceling payment intent:', stripeError);
    }
  }
  
  // Update reservation status to cancelled
  const { error } = await supabaseAdmin
    .from('reservations')
    .update({ status: 'cancelled' })
    .eq('id', id);
  
  if (error) throw error;
  
  res.json({
    success: true,
    message: 'Reservation cancelled successfully'
  });
}));

export default router;