// backend/routes/reservations.routes.js
import express from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper function to generate confirmation code
const generateConfirmationCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Helper function to calculate total cost
const calculateTotal = (checkIn, checkOut, dailyRate, weeklyRate, monthlyRate) => {
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  if (days <= 0) return 0;
  
  // Apply best rate for customer
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

// GET - Get my reservations (authenticated user)
router.get('/my-reservations', authenticateUser, async (req, res) => {
  try {
    console.log(`📍 GET /api/reservations/my-reservations - User ${req.user.email}`);
    
    const { status, upcoming } = req.query;
    
    let query = supabaseAdmin
      .from('reservations')
      .select(`
        *,
        lot:lots(
          lot_number,
          size,
          hookups
        )
      `)
      .eq('user_id', req.userId);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (upcoming === 'true') {
      const today = new Date().toISOString().split('T')[0];
      query = query.gte('check_in', today);
    }
    
    const { data, error } = await query.order('check_in', { ascending: false });
    
    if (error) throw error;
    
    console.log(`✅ Found ${data.length} reservations for user`);
    
    res.json({
      success: true,
      data,
      count: data.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching reservations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reservations',
      message: error.message
    });
  }
});

// GET - Get all reservations (admin only)
router.get('/', authenticateUser, requireAdmin, async (req, res) => {
  try {
    console.log('📍 GET /api/reservations - Admin fetching all reservations');
    
    const { status, lot_id, from_date, to_date } = req.query;
    
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
    
    if (status) query = query.eq('status', status);
    if (lot_id) query = query.eq('lot_id', lot_id);
    if (from_date) query = query.gte('check_in', from_date);
    if (to_date) query = query.lte('check_out', to_date);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log(`✅ Found ${data.length} total reservations`);
    
    res.json({
      success: true,
      data,
      count: data.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching reservations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reservations',
      message: error.message
    });
  }
});

// POST - Create new reservation
router.post('/', authenticateUser, async (req, res) => {
  try {
    console.log(`📍 POST /api/reservations - Creating reservation for ${req.user.email}`);
    
    const {
      lot_id,
      check_in,
      check_out,
      guests_count = 1,
      rv_info,
      special_requests
    } = req.body;
    
    // Validate required fields
    if (!lot_id || !check_in || !check_out) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'lot_id, check_in, and check_out are required'
      });
    }
    
    // Validate dates
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkInDate < today) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Check-in date cannot be in the past'
      });
    }
    
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Check-out date must be after check-in date'
      });
    }
    
    // Check if lot exists and is available
    const { data: lot, error: lotError } = await supabaseAdmin
      .from('lots')
      .select('*')
      .eq('id', lot_id)
      .single();
    
    if (lotError || !lot) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Lot not found'
      });
    }
    
    // Check for conflicting reservations
    const { data: conflicts, error: conflictError } = await supabaseAdmin
      .from('reservations')
      .select('id')
      .eq('lot_id', lot_id)
      .neq('status', 'cancelled')
      .or(`and(check_in.lte.${check_out},check_out.gte.${check_in})`);
    
    if (conflictError) throw conflictError;
    
    if (conflicts && conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'Lot is not available for the selected dates'
      });
    }
    
    // Calculate total amount
    const totalAmount = calculateTotal(
      check_in,
      check_out,
      lot.daily_rate,
      lot.weekly_rate,
      lot.monthly_rate
    );
    
    // Create reservation
    const { data: reservation, error: resError } = await supabaseAdmin
      .from('reservations')
      .insert({
        user_id: req.userId,
        lot_id,
        check_in,
        check_out,
        guests_count,
        rv_info: rv_info || null,
        special_requests: special_requests || null,
        total_amount: totalAmount,
        confirmation_code: generateConfirmationCode(),
        status: 'pending'
      })
      .select()
      .single();
    
    if (resError) throw resError;
    
    console.log(`✅ Reservation created: ${reservation.confirmation_code}`);
    
    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      data: reservation
    });
    
  } catch (error) {
    console.error('❌ Error creating reservation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create reservation',
      message: error.message
    });
  }
});

// PATCH - Update reservation status
router.patch('/:id/status', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`📍 PATCH /api/reservations/${id}/status - Updating to ${status}`);
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Valid status required: pending, confirmed, cancelled, or completed'
      });
    }
    
    // Check if user owns this reservation or is admin
    let query = supabaseAdmin
      .from('reservations')
      .select('*')
      .eq('id', id);
    
    if (!req.isAdmin) {
      query = query.eq('user_id', req.userId);
    }
    
    const { data: existing, error: fetchError } = await query.single();
    
    if (fetchError || !existing) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Reservation not found or access denied'
      });
    }
    
    // Update reservation
    const { data, error } = await supabaseAdmin
      .from('reservations')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`✅ Reservation ${data.confirmation_code} updated to ${status}`);
    
    res.json({
      success: true,
      message: `Reservation ${status}`,
      data
    });
    
  } catch (error) {
    console.error('❌ Error updating reservation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update reservation',
      message: error.message
    });
  }
});

// DELETE - Cancel reservation
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`📍 DELETE /api/reservations/${id} - Cancelling reservation`);
    
    // Check if user owns this reservation or is admin
    let query = supabaseAdmin
      .from('reservations')
      .select('*')
      .eq('id', id);
    
    if (!req.isAdmin) {
      query = query.eq('user_id', req.userId);
    }
    
    const { data: existing, error: fetchError } = await query.single();
    
    if (fetchError || !existing) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Reservation not found or access denied'
      });
    }
    
    // Check if reservation can be cancelled
    if (existing.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Cannot cancel completed reservation'
      });
    }
    
    // Update to cancelled instead of deleting
    const { data, error } = await supabaseAdmin
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`✅ Reservation ${data.confirmation_code} cancelled`);
    
    res.json({
      success: true,
      message: 'Reservation cancelled successfully',
      data
    });
    
  } catch (error) {
    console.error('❌ Error cancelling reservation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel reservation',
      message: error.message
    });
  }
});

export default router;