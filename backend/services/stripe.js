// backend/services/stripe.js
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Create a customer in Stripe
export const createCustomer = async (email, name, metadata = {}) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata
    });
    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
};

// Create a payment intent for reservations
export const createPaymentIntent = async (amount, customerId, metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      customer: customerId,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Create a checkout session for online payments
export const createCheckoutSession = async ({
  customerId,
  lineItems,
  successUrl,
  cancelUrl,
  metadata = {}
}) => {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata
    });
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Create an invoice for monthly charges
export const createInvoice = async (customerId, items, dueDate) => {
  try {
    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: 'send_invoice',
      due_date: Math.floor(dueDate.getTime() / 1000),
      auto_advance: true
    });

    // Add invoice items
    for (const item of items) {
      await stripe.invoiceItems.create({
        customer: customerId,
        invoice: invoice.id,
        amount: Math.round(item.amount * 100),
        description: item.description,
        metadata: item.metadata || {}
      });
    }

    // Finalize and send the invoice
    await stripe.invoices.finalizeInvoice(invoice.id);
    await stripe.invoices.sendInvoice(invoice.id);

    return invoice;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

// Retrieve a payment intent
export const retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
};

// Cancel a payment intent
export const cancelPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error canceling payment intent:', error);
    throw error;
  }
};

// Process refund
export const createRefund = async (paymentIntentId, amount = null) => {
  try {
    const refundData = {
      payment_intent: paymentIntentId
    };
    
    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }
    
    const refund = await stripe.refunds.create(refundData);
    return refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw error;
  }
};

// Webhook signature verification
export const verifyWebhookSignature = (payload, signature, endpointSecret) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      endpointSecret
    );
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw error;
  }
};

export default stripe;