// backend/routes/inquiries.routes.js
import express from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Submit new inquiry (public)
router.post('/', asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  
  // Validate required fields
  if (!name || !email || !message) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Name, email, and message are required'
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid email format'
    });
  }
  
  // Create inquiry
  const { data, error } = await supabaseAdmin
    .from('inquiries')
    .insert({
      name,
      email,
      phone,
      subject: subject || 'General Inquiry',
      message
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // TODO: Send email notification to admin
  // TODO: Send confirmation email to user
  
  res.status(201).json({
    success: true,
    message: 'Thank you for your inquiry. We will respond within 24-48 hours.',
    inquiry_id: data.id
  });
}));

// Get all inquiries (admin only)
router.get('/', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  const { responded, from_date, to_date, search } = req.query;
  
  let query = supabaseAdmin
    .from('inquiries')
    .select('*');
  
  if (responded !== undefined) {
    query = query.eq('responded', responded === 'true');
  }
  
  if (from_date) {
    query = query.gte('created_at', from_date);
  }
  
  if (to_date) {
    query = query.lte('created_at', to_date);
  }
  
  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,subject.ilike.%${search}%,message.ilike.%${search}%`);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  
  res.json({
    success: true,
    data,
    count: data.length,
    stats: {
      total: data.length,
      responded: data.filter(i => i.responded).length,
      pending: data.filter(i => !i.responded).length
    }
  });
}));

// Get single inquiry (admin only)
router.get('/:id', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabaseAdmin
    .from('inquiries')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Inquiry not found'
      });
    }
    throw error;
  }
  
  res.json({
    success: true,
    data
  });
}));

// Update inquiry status (admin only)
router.patch('/:id/respond', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { response_notes } = req.body;
  
  const { data, error } = await supabaseAdmin
    .from('inquiries')
    .update({
      responded: true,
      response_notes
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Inquiry not found'
      });
    }
    throw error;
  }
  
  res.json({
    success: true,
    data,
    message: 'Inquiry marked as responded'
  });
}));

// Delete inquiry (admin only)
router.delete('/:id', authenticateUser, requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const { error } = await supabaseAdmin
    .from('inquiries')
    .delete()
    .eq('id', id);
  
  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Inquiry not found'
      });
    }
    throw error;
  }
  
  res.json({
    success: true,
    message: 'Inquiry deleted successfully'
  });
}));

export default router;