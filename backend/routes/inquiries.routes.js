// backend/routes/inquiries.routes.js
import express from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// POST - Submit new inquiry (public - no auth required)
router.post('/', async (req, res) => {
  try {
    console.log('📍 POST /api/inquiries - New inquiry submission');
    
    const { name, email, phone, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Name, email, and message are required'
      });
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
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
        phone: phone || null,
        subject: subject || 'General Inquiry',
        message,
        responded: false
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`✅ Inquiry created from ${email}`);
    
    res.status(201).json({
      success: true,
      message: 'Thank you for your inquiry! We will respond within 24-48 hours.',
      inquiry_id: data.id
    });
    
  } catch (error) {
    console.error('❌ Error creating inquiry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit inquiry',
      message: error.message
    });
  }
});

// GET all inquiries (admin only)
router.get('/', authenticateUser, requireAdmin, async (req, res) => {
  try {
    console.log('📍 GET /api/inquiries - Admin fetching all inquiries');
    
    const { responded } = req.query;
    
    let query = supabaseAdmin
      .from('inquiries')
      .select('*');
    
    if (responded !== undefined) {
      query = query.eq('responded', responded === 'true');
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log(`✅ Found ${data.length} inquiries`);
    
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
    
  } catch (error) {
    console.error('❌ Error fetching inquiries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inquiries',
      message: error.message
    });
  }
});

// PATCH - Mark inquiry as responded (admin only)
router.patch('/:id/respond', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { response_notes } = req.body;
    
    console.log(`📍 PATCH /api/inquiries/${id}/respond - Marking as responded`);
    
    const { data, error } = await supabaseAdmin
      .from('inquiries')
      .update({
        responded: true,
        response_notes: response_notes || null
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Inquiry not found'
        });
      }
      throw error;
    }
    
    console.log('✅ Inquiry marked as responded');
    
    res.json({
      success: true,
      data,
      message: 'Inquiry marked as responded'
    });
    
  } catch (error) {
    console.error('❌ Error updating inquiry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update inquiry',
      message: error.message
    });
  }
});

export default router;