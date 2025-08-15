// backend/routes/charges.routes.js
import express from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET - Get my charges (residents only)
router.get('/my-charges', authenticateUser, async (req, res) => {
  try {
    console.log(`📍 GET /api/charges/my-charges - User ${req.user.email}`);
    
    // Check if user is a resident
    if (!req.isResident && !req.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only residents can view charges'
      });
    }
    
    const { payment_status } = req.query;
    
    let query = supabaseAdmin
      .from('charges')
      .select(`
        *,
        lot:lots(
          lot_number
        )
      `)
      .eq('resident_id', req.userId);
    
    if (payment_status) {
      query = query.eq('payment_status', payment_status);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Calculate totals
    const totals = {
      total: 0,
      paid: 0,
      pending: 0,
      overdue: 0
    };
    
    data.forEach(charge => {
      const amount = parseFloat(charge.amount) || 0;
      totals.total += amount;
      
      if (charge.payment_status === 'paid') {
        totals.paid += amount;
      } else if (charge.payment_status === 'pending') {
        // Check if overdue
        if (charge.due_date && new Date(charge.due_date) < new Date()) {
          totals.overdue += amount;
        } else {
          totals.pending += amount;
        }
      }
    });
    
    console.log(`✅ Found ${data.length} charges for resident`);
    
    res.json({
      success: true,
      data,
      totals,
      count: data.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching charges:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch charges',
      message: error.message
    });
  }
});

// GET - Get all charges (admin only)
router.get('/', authenticateUser, requireAdmin, async (req, res) => {
  try {
    console.log('📍 GET /api/charges - Admin fetching all charges');
    
    const { resident_id, payment_status, charge_type } = req.query;
    
    let query = supabaseAdmin
      .from('charges')
      .select(`
        *,
        resident:profiles(
          full_name,
          email,
          lot_number
        ),
        lot:lots(
          lot_number
        )
      `);
    
    if (resident_id) query = query.eq('resident_id', resident_id);
    if (payment_status) query = query.eq('payment_status', payment_status);
    if (charge_type) query = query.eq('charge_type', charge_type);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log(`✅ Found ${data.length} total charges`);
    
    res.json({
      success: true,
      data,
      count: data.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching charges:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch charges',
      message: error.message
    });
  }
});

// POST - Create new charge (admin only)
router.post('/', authenticateUser, requireAdmin, async (req, res) => {
  try {
    console.log('📍 POST /api/charges - Admin creating new charge');
    
    const {
      resident_id,
      lot_id,
      charge_type,
      description,
      amount,
      due_date,
      billing_period_start,
      billing_period_end
    } = req.body;
    
    // Validate required fields
    if (!resident_id || !charge_type || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'resident_id, charge_type, and amount are required'
      });
    }
    
    // Validate charge type
    const validTypes = ['rent', 'electricity', 'water', 'sewer', 'wifi', 'late_fee', 'other'];
    if (!validTypes.includes(charge_type)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: `Invalid charge_type. Must be one of: ${validTypes.join(', ')}`
      });
    }
    
    // Verify resident exists
    const { data: resident, error: residentError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', resident_id)
      .single();
    
    if (residentError || !resident) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Resident not found'
      });
    }
    
    // Create charge
    const { data, error } = await supabaseAdmin
      .from('charges')
      .insert({
        resident_id,
        lot_id: lot_id || null,
        charge_type,
        description: description || `${charge_type} charge`,
        amount,
        due_date: due_date || null,
        billing_period_start: billing_period_start || null,
        billing_period_end: billing_period_end || null,
        payment_status: 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`✅ Charge created for resident ${resident.email}: $${amount}`);
    
    res.status(201).json({
      success: true,
      message: 'Charge created successfully',
      data
    });
    
  } catch (error) {
    console.error('❌ Error creating charge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create charge',
      message: error.message
    });
  }
});

// POST - Create monthly charges for all residents (admin only)
router.post('/bulk-monthly', authenticateUser, requireAdmin, async (req, res) => {
  try {
    console.log('📍 POST /api/charges/bulk-monthly - Creating monthly charges');
    
    const { month, year } = req.body;
    
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'month (1-12) and year are required'
      });
    }
    
    // Get all residents with lots
    const { data: residents, error: resError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, lot_number')
      .eq('role', 'resident')
      .not('lot_number', 'is', null);
    
    if (resError) throw resError;
    
    if (!residents || residents.length === 0) {
      return res.json({
        success: true,
        message: 'No residents found with assigned lots',
        count: 0
      });
    }
    
    // Get lot information
    const { data: lots, error: lotsError } = await supabaseAdmin
      .from('lots')
      .select('id, lot_number, monthly_rate');
    
    if (lotsError) throw lotsError;
    
    // Create a map for quick lot lookup
    const lotMap = new Map(lots.map(lot => [lot.lot_number, lot]));
    
    // Prepare charges
    const charges = [];
    const billingPeriodStart = new Date(year, month - 1, 1);
    const billingPeriodEnd = new Date(year, month, 0);
    const dueDate = new Date(year, month - 1, 5); // Due on the 5th
    
    for (const resident of residents) {
      const lot = lotMap.get(resident.lot_number);
      
      if (lot && lot.monthly_rate) {
        charges.push({
          resident_id: resident.id,
          lot_id: lot.id,
          charge_type: 'rent',
          description: `Monthly rent for Lot ${resident.lot_number} - ${month}/${year}`,
          amount: lot.monthly_rate,
          due_date: dueDate.toISOString().split('T')[0],
          billing_period_start: billingPeriodStart.toISOString().split('T')[0],
          billing_period_end: billingPeriodEnd.toISOString().split('T')[0],
          payment_status: 'pending'
        });
      }
    }
    
    if (charges.length === 0) {
      return res.json({
        success: true,
        message: 'No charges to create',
        count: 0
      });
    }
    
    // Insert all charges
    const { data: createdCharges, error: insertError } = await supabaseAdmin
      .from('charges')
      .insert(charges)
      .select();
    
    if (insertError) throw insertError;
    
    console.log(`✅ Created ${createdCharges.length} monthly charges`);
    
    res.status(201).json({
      success: true,
      message: `Created ${createdCharges.length} monthly charges for ${month}/${year}`,
      data: createdCharges,
      count: createdCharges.length
    });
    
  } catch (error) {
    console.error('❌ Error creating bulk charges:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create bulk charges',
      message: error.message
    });
  }
});

// PATCH - Mark charge as paid (admin only)
router.patch('/:id/mark-paid', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method = 'cash', notes } = req.body;
    
    console.log(`📍 PATCH /api/charges/${id}/mark-paid - Marking as paid`);
    
    // Get the charge
    const { data: charge, error: fetchError } = await supabaseAdmin
      .from('charges')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !charge) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Charge not found'
      });
    }
    
    // Update charge status
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('charges')
      .update({
        payment_status: 'paid',
        paid_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    // Create payment record
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: charge.resident_id,
        charge_id: id,
        amount: charge.amount,
        payment_method,
        notes: notes || null
      });
    
    if (paymentError) {
      console.error('Warning: Payment record creation failed:', paymentError);
    }
    
    console.log(`✅ Charge marked as paid: $${charge.amount}`);
    
    res.json({
      success: true,
      message: 'Charge marked as paid',
      data: updated
    });
    
  } catch (error) {
    console.error('❌ Error marking charge as paid:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update charge',
      message: error.message
    });
  }
});

export default router;