// backend/routes/auth.routes.js
import express from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// POST - Register new user
router.post('/register', async (req, res) => {
  try {
    console.log('📍 POST /api/auth/register - New user registration');
    
    const { email, password, full_name, phone } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Email and password are required'
      });
    }
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for testing
      user_metadata: {
        full_name: full_name || '',
        phone: phone || ''
      }
    });
    
    if (authError) throw authError;
    
    // Update profile with additional info
    if (authData.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          full_name: full_name || null,
          phone: phone || null,
          role: 'guest' // Default role
        })
        .eq('id', authData.user.id);
      
      if (profileError) {
        console.error('Profile update error:', profileError);
      }
    }
    
    console.log(`✅ User registered: ${email}`);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      user: {
        id: authData.user.id,
        email: authData.user.email
      }
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Handle duplicate email
    if (error.message?.includes('already registered')) {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'Email already registered'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: error.message
    });
  }
});

// GET - Get current user profile
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    console.log('📍 GET /api/auth/profile - Fetching user profile');
    
    res.json({
      success: true,
      data: {
        user: req.user,
        profile: req.userProfile
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
      message: error.message
    });
  }
});

// PUT - Update user profile
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    console.log('📍 PUT /api/auth/profile - Updating user profile');
    
    const { full_name, phone, emergency_contact, emergency_phone, vehicle_info } = req.body;
    
    const updates = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (phone !== undefined) updates.phone = phone;
    if (emergency_contact !== undefined) updates.emergency_contact = emergency_contact;
    if (emergency_phone !== undefined) updates.emergency_phone = emergency_phone;
    if (vehicle_info !== undefined) updates.vehicle_info = vehicle_info;
    
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', req.userId)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('✅ Profile updated successfully');
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data
    });
    
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
      message: error.message
    });
  }
});

// POST - Make a user an admin (for testing - remove in production!)
router.post('/make-admin', authenticateUser, async (req, res) => {
  try {
    console.log('📍 POST /api/auth/make-admin - Converting user to admin');
    
    // For testing only - in production, only admins should be able to do this
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', req.userId)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`✅ User ${req.user.email} is now an admin`);
    
    res.json({
      success: true,
      message: 'You are now an admin!',
      data
    });
    
  } catch (error) {
    console.error('❌ Error making admin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update role',
      message: error.message
    });
  }
});

// POST - Make a user a resident (for testing)
router.post('/make-resident', authenticateUser, async (req, res) => {
  try {
    console.log('📍 POST /api/auth/make-resident - Converting user to resident');
    
    const { lot_number } = req.body;
    
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        role: 'resident',
        lot_number: lot_number || 'A1'
      })
      .eq('id', req.userId)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`✅ User ${req.user.email} is now a resident`);
    
    res.json({
      success: true,
      message: 'You are now a resident!',
      data
    });
    
  } catch (error) {
    console.error('❌ Error making resident:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update role',
      message: error.message
    });
  }
});

export default router;