// backend/routes/lots.routes.js
import express from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Get all lots with availability
router.get('/', asyncHandler(async (req, res) => {
  const { status, size, min_price, max_price } = req.query;
  
  let query = supabaseAdmin
    .from('lots')
    .select(`
      *,
      current_resident:profiles!lots_current_resident_id_fkey(
        id,
        full_name,
        email
      )
    `);
  
  if (status) {
    query = query.eq('status', status);
  }
  
  if (size) {
    query = query.eq('size', size);
  }
  
  if (min_price) {
    query = query.gte('monthly_rate', min_price);
  }
  
  if (max_price) {
    query = query.lte('monthly_rate', max_price);
  }
  
  const { data, error } = await query.order('lot_number');
  
  if (error) throw error;
  
  res.json({
    success: true,
    data,
    count: data.length
  });
}));

// Get available lots for date range
router.get('/availability', asyncHandler(async (req, res) => {
  const { check_in, check_out } = req.query;
  
  if (!check_in || !check_out) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'check_in and check_out dates are required'
    });
  }
  
  // Get all lots
  const { data: lots, error: lotsError } = await supabaseAdmin
    .from('lots')
    .select('*')
    .eq('status', 'available')
    .order('lot_number');
  
  if (lotsError) throw lotsError;
  
  // Get reservations that overlap with the requested dates
  const { data: reservations, error: reservationsError } = await supabaseAdmin
    .from('reservations')
    .select('lot_id')
    .or(`check_in.lte.${check_out},check_out.gte.${check_in}`)
    .in('status', ['confirmed', 'pending']);
  
  if (reservationsError) throw reservationsError;
  
  // Filter out lots with overlapping reservations
  const reservedLotIds = reservations.map(r => r.lot_id);
  const availableLots = lots.filter(lot => !reservedLotIds.includes(lot.id));
  
  res.json({
    success: true,
    data: availableLots,
    count: availableLots.length,
    date_range: { check_in, check_out }
  });
}));

// Get single lot details
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabaseAdmin
    .from('lots')
    .select(`
      *,
      current_resident:profiles!lots_current_resident_id_fkey(
        id,
        full_name,
        email,
        phone
      ),
      reservations(
        id,
        check_in,
        check_out,
        status,
        user:profiles(
          full_name
        )
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Lot not found'
      });
    }
    throw error;
  }
  
  res.json({
    success: true,
    data
  });
}));

// Create new lot (admin only)
router.post('/', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  const {
    lot_number,
    size,
    hookups,
    monthly_rate,
    daily_rate,
    weekly_rate,
    description,
    amenities,
    images
  } = req.body;
  
  if (!lot_number) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Lot number is required'
    });
  }
  
  const { data, error } = await supabaseAdmin
    .from('lots')
    .insert({
      lot_number,
      size,
      hookups,
      monthly_rate,
      daily_rate,
      weekly_rate,
      description,
      amenities,
      images,
      status: 'available'
    })
    .select()
    .single();
  
  if (error) throw error;
  
  res.status(201).json({
    success: true,
    data,
    message: 'Lot created successfully'
  });
}));

// Update lot (admin only)
router.put('/:id', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  // Remove fields that shouldn't be updated directly
  delete updates.id;
  delete updates.created_at;
  delete updates.updated_at;
  
  const { data, error } = await supabaseAdmin
    .from('lots')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Lot not found'
      });
    }
    throw error;
  }
  
  res.json({
    success: true,
    data,
    message: 'Lot updated successfully'
  });
}));

// Delete lot (admin only)
router.delete('/:id', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if lot has active reservations
  const { data: reservations, error: resError } = await supabaseAdmin
    .from('reservations')
    .select('id')
    .eq('lot_id', id)
    .in('status', ['confirmed', 'pending']);
  
  if (resError) throw resError;
  
  if (reservations && reservations.length > 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Cannot delete lot with active reservations'
    });
  }
  
  const { error } = await supabaseAdmin
    .from('lots')
    .delete()
    .eq('id', id);
  
  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Lot not found'
      });
    }
    throw error;
  }
  
  res.json({
    success: true,
    message: 'Lot deleted successfully'
  });
}));

export default router;