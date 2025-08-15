// backend/routes/lots.routes.js
import express from 'express';
import { supabaseAdmin } from '../services/supabase.js';

const router = express.Router();

// GET all lots
router.get('/', async (req, res) => {
  try {
    console.log('📍 GET /api/lots - Fetching all lots');
    
    const { data, error } = await supabaseAdmin
      .from('lots')
      .select('*')
      .order('lot_number');
    
    if (error) throw error;
    
    console.log(`✅ Found ${data?.length || 0} lots`);
    
    res.json({
      success: true,
      count: data?.length || 0,
      data: data || []
    });
  } catch (error) {
    console.error('❌ Error fetching lots:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lots',
      message: error.message
    });
  }
});

// GET single lot by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📍 GET /api/lots/${id} - Fetching single lot`);
    
    const { data, error } = await supabaseAdmin
      .from('lots')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Lot not found'
        });
      }
      throw error;
    }
    
    console.log('✅ Lot found:', data.lot_number);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('❌ Error fetching lot:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lot',
      message: error.message
    });
  }
});

// POST - Create a new lot (for testing)
router.post('/', async (req, res) => {
  try {
    console.log('📍 POST /api/lots - Creating new lot');
    console.log('Request body:', req.body);
    
    const {
      lot_number,
      size = '30x60',
      hookups = ['water', 'electric', 'sewer'],
      monthly_rate = 500,
      daily_rate = 50,
      weekly_rate = 300,
      description = 'Standard RV lot'
    } = req.body;
    
    // Validate required field
    if (!lot_number) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'lot_number is required'
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
        status: 'available'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('✅ Lot created successfully:', data.lot_number);
    
    res.status(201).json({
      success: true,
      message: 'Lot created successfully',
      data
    });
  } catch (error) {
    console.error('❌ Error creating lot:', error);
    
    // Handle duplicate lot number
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'A lot with this number already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create lot',
      message: error.message
    });
  }
});

// DELETE - Remove a lot (for testing cleanup)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📍 DELETE /api/lots/${id} - Deleting lot`);
    
    const { error } = await supabaseAdmin
      .from('lots')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    console.log('✅ Lot deleted successfully');
    
    res.json({
      success: true,
      message: 'Lot deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting lot:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete lot',
      message: error.message
    });
  }
});

export default router;