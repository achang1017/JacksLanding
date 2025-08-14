// backend/routes/charges.routes.js
import express from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { createInvoice } from '../services/stripe.js';
import { requireAdmin, requireResident } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Get current user's charges (residents)
router.get('/my-charges', requireResident, asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { payment_status, from_date, to_date } = req.query;
  
  let query = supabaseAdmin
    .from('charges')
    .select(`
      *,
      lot:lots(
        lot_number
      )
    `)
    .eq('resident_id', userId);
  
  if (payment_status) {
    query = query.eq('payment_status', payment_status);
  }
  
  if (from_date) {
    query = query.gte('created_at', from_date);
  }
  
  if (to_date) {
    query = query.lte('created_at', to_date);
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
    totals.total += parseFloat(charge.amount);
    if (charge.payment_status === 'paid') {
      totals.paid += parseFloat(charge.amount);
    } else if (charge.payment_status === 'pending') {
      totals.pending += parseFloat(charge.amount);
    } else if (charge.payment_status === 'overdue') {
      totals.overdue += parseFloat(charge.amount);
    }
  });
  
  res.json({
    success: true,
    data,
    totals,
    count: data.length
  });
}));

// Get all charges (admin only)
router.get('/', requireAdmin, asyncHandler(async (req, res) => {
  const { resident_id, payment_status, charge_type, from_date, to_date } = req.query;
  
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
  
  if (resident_id) {
    query = query.eq('resident_id', resident_id);
  }
  
  if (payment_status) {
    query = query.eq('payment_status', payment_status);
  }
  
  if (charge_type) {
    query = query.eq('charge_type', charge_type);
  }
  
  if (from_date) {
    query = query.gte('created_at', from_date);
  }
  
  if (to_date) {
    query = query.lte('created_at', to_date);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  
  res.json({
    success: true,
    data,
    count: data.length
  });
}));

// Get single charge
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const isUserAdmin = await requireAdmin(userId);
  
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
      ),
      payments(
        id,
        amount,
        payment_method,
        created_at
      )
    `)
    .eq('id', id);
  
  // Non-admins can only view their own charges
  if (!isUserAdmin) {
    query = query.eq('resident_id', userId);
  }
  
  const { data, error } = await query.single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Charge not found'
      });
    }
    throw error;
  }
  
  res.json({
    success: true,
    data
  });
}));

// Create new charge (admin only)
router.post('/', requireAdmin, asyncHandler(async (req, res) => {
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
      error: 'Bad Request',
      message: 'resident_id, charge_type, and amount are required'
    });
  }
  
  // Get resident's Stripe customer ID
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('stripe_customer_id, email, full_name')
    .eq('id', resident_id)
    .single();
  
  if (profileError) throw profileError;
  
  // Create charge in database
  const { data: charge, error: chargeError } = await supabaseAdmin
    .from('charges')
    .insert({
      resident_id,
      lot_id,
      charge_type,
      description,
      amount,
      due_date,
      billing_period_start,
      billing_period_end,
      payment_status: 'pending'
    })
    .select()
    .single();
  
  if (chargeError) throw chargeError;
  
  // Create Stripe invoice if customer exists
  if (profile.stripe_customer_id && due_date) {
    try {
      const invoice = await createInvoice(
        profile.stripe_customer_id,
        [{
          amount,
          description: `${charge_type}: ${description || ''}`
        }],
        new Date(due_date)
      );
      
      // Update charge with Stripe invoice ID
      await supabaseAdmin
        .from('charges')
        .update({ stripe_invoice_id: invoice.id })
        .eq('id', charge.id);
      
      charge.stripe_invoice_id = invoice.id;
    } catch (stripeError) {
      console.error('Error creating Stripe invoice:', stripeError);
    }
  }
  
  res.status(201).json({
    success: true,
    data: charge,
    message: 'Charge created successfully'
  });
}));

// Create bulk monthly charges (admin only)
router.post('/bulk-monthly', requireAdmin, asyncHandler(async (req, res) => {
  const { month, year } = req.body;
  
  if (!month || !year) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'month and year are required'
    });
  }
  
  // Get all residents with their lots
  const { data: residents, error: residentsError } = await supabaseAdmin
    .from('profiles')
    .select(`
      id,
      email,
      full_name,
      lot_number,
      stripe_customer_id
    `)
    .eq('role', 'resident')
    .not('lot_number', 'is', null);
  
  if (residentsError) throw residentsError;
  
  // Get lot information
  const { data: lots, error: lotsError } = await supabaseAdmin
    .from('lots')
    .select('id, lot_number, monthly_rate');
  
  if (lotsError) throw lotsError;
  
  const lotMap = new Map(lots.map(lot => [lot.lot_number, lot]));
  
  // Create charges for each resident
  const charges = [];
  const billingPeriodStart = new Date(year, month - 1, 1);
  const billingPeriodEnd = new Date(year, month, 0);
  const dueDate = new Date(year, month - 1, 5); // Due on the 5th
  
  for (const resident of residents) {
    const lot = lotMap.get(resident.lot_number);
    
    if (lot && lot.monthly_rate) {
      const chargeData = {
        resident_id: resident.id,
        lot_id: lot.id,
        charge_type: 'rent',
        description: `Monthly rent for ${resident.lot_number} - ${month}/${year}`,
        amount: lot.monthly_rate,
        due_date: dueDate.toISOString(),
        billing_period_start: billingPeriodStart.toISOString(),
        billing_period_end: billingPeriodEnd.toISOString(),
        payment_status: 'pending'
      };
      
      charges.push(chargeData);
    }
  }
  
  // Insert all charges
  const { data: createdCharges, error: insertError } = await supabaseAdmin
    .from('charges')
    .insert(charges)
    .select();
  
  if (insertError) throw insertError;
  
  res.status(201).json({
    success: true,
    data: createdCharges,
    count: createdCharges.length,
    message: `Created ${createdCharges.length} monthly charges`
  });
}));

// Update charge (admin only)
router.put('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  // Remove fields that shouldn't be updated
  delete updates.id;
  delete updates.created_at;
  delete updates.updated_at;
  
  const { data, error } = await supabaseAdmin
    .from('charges')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Charge not found'
      });
    }
    throw error;
  }
  
  res.json({
    success: true,
    data,
    message: 'Charge updated successfully'
  });
}));

// Mark charge as paid (admin only)
router.patch('/:id/mark-paid', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { payment_method, notes } = req.body;
  
  // Update charge status
  const { data: charge, error: updateError } = await supabaseAdmin
    .from('charges')
    .update({
      payment_status: 'paid',
      paid_date: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (updateError) {
    if (updateError.code === 'PGRST116') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Charge not found'
      });
    }
    throw updateError;
  }
  
  // Create payment record
  const { error: paymentError } = await supabaseAdmin
    .from('payments')
    .insert({
      user_id: charge.resident_id,
      charge_id: id,
      amount: charge.amount,
      payment_method: payment_method || 'manual',
      notes
    });
  
  if (paymentError) throw paymentError;
  
  res.json({
    success: true,
    data: charge,
    message: 'Charge marked as paid'
  });
}));

// Delete charge (admin only)
router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const { error } = await supabaseAdmin
    .from('charges')
    .delete()
    .eq('id', id);
  
  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Charge not found'
      });
    }
    throw error;
  }
  
  res.json({
    success: true,
    message: 'Charge deleted successfully'
  });
}));

export default router;