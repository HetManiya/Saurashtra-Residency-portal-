import express from 'express';
import Stripe from 'stripe';
import { GoogleGenAI } from "@google/genai";
import { protect } from '../middleware/authMiddleware';
import Maintenance from '../models/Maintenance';
import Transaction from '../models/Transaction';
import User from '../models/User';

const router = express.Router();

// Lazy initialization of Stripe
let stripe: Stripe | null = null;
const getStripe = () => {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is missing');
    stripe = new Stripe(key);
  }
  return stripe;
};

// AI Client
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing');
  return new GoogleGenAI({ apiKey });
};

/**
 * @route   POST /api/v1/payments/create-order
 * @desc    Create a Stripe PaymentIntent for maintenance bill
 */
router.post('/create-order', protect, async (req: any, res) => {
  try {
    const { maintenanceId } = req.body;
    const bill = await Maintenance.findById(maintenanceId);

    if (!bill || bill.status === 'Paid') {
      return res.status(400).json({ message: 'Invalid or already paid bill' });
    }

    const stripeClient = getStripe();
    
    // Create PaymentIntent
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: bill.amount * 100, // Stripe expects amount in cents/paise
      currency: 'inr',
      metadata: {
        userId: req.user.id,
        maintenanceId: bill._id.toString(),
        flatId: bill.flatId
      },
      automatic_payment_methods: { enabled: true },
    });

    // Log the transaction as PENDING
    await Transaction.create({
      userId: req.user.id,
      maintenanceId: bill._id,
      amount: bill.amount,
      gatewayOrderId: paymentIntent.id,
      status: 'PENDING'
    });

    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      throw new Error('STRIPE_PUBLISHABLE_KEY is missing in server environment');
    }

    res.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: publishableKey,
      amount: bill.amount,
      currency: 'INR'
    });
  } catch (error: any) {
    console.error('Payment order creation failed:', error);
    res.status(500).json({ message: error.message || 'Payment initialization failed' });
  }
});

/**
 * @route   POST /api/v1/payments/verify
 * @desc    Verify payment status with Stripe and update records
 */
router.post('/verify', protect, async (req: any, res) => {
  try {
    const { paymentIntentId } = req.body;
    if (!paymentIntentId) {
      return res.status(400).json({ message: 'PaymentIntent ID is required' });
    }

    const stripeClient = getStripe();
    const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // 1. Update Transaction Status
      const transaction = await Transaction.findOneAndUpdate(
        { gatewayOrderId: paymentIntent.id },
        { status: 'SUCCESS', gatewayPaymentId: paymentIntent.latest_charge as string },
        { new: true }
      );

      if (transaction) {
        // 2. Mark Maintenance Bill as Paid
        await Maintenance.findByIdAndUpdate(transaction.maintenanceId, {
          status: 'Paid',
          paidDate: new Date()
        });
        return res.json({ success: true, message: 'Payment verified and record updated.' });
      } else {
        return res.status(404).json({ message: 'Transaction not found for this payment.' });
      }
    } else {
      return res.status(400).json({ message: `Payment status is ${paymentIntent.status}` });
    }
  } catch (error: any) {
    console.error('Payment verification failed:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

/**
 * @route   POST /api/v1/payments/setup-recurring
 * @desc    Setup a Stripe Subscription for recurring maintenance
 */
router.post('/setup-recurring', protect, async (req: any, res) => {
  try {
    const stripeClient = getStripe();
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let customerId = user.stripeCustomerId;

    // 1. Create or get Stripe Customer
    if (!customerId) {
      const customer = await stripeClient.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user._id.toString() }
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // 2. Create a Product and Price for Maintenance if not exists
    // In a real app, you'd fetch existing ones. For demo, we'll use a dynamic price.
    const product = await stripeClient.products.create({
      name: 'Monthly Maintenance Fee',
      description: `Recurring maintenance for ${user.flatId}`
    });

    const price = await stripeClient.prices.create({
      unit_amount: 2500 * 100, // 2500 INR
      currency: 'inr',
      recurring: { interval: 'month' },
      product: product.id,
    });

    // 3. Create Checkout Session for Subscription
    const session = await stripeClient.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: price.id, quantity: 1 }],
      metadata: { userId: user._id.toString() },
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payments`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Recurring setup failed:', error);
    res.status(500).json({ message: error.message || 'Failed to setup recurring payments' });
  }
});

/**
 * @route   GET /api/v1/payments/reminders
 * @desc    Check for overdue payments and generate reminders
 */
router.get('/reminders', protect, async (req: any, res) => {
  try {
    // Only admins or committee can trigger reminders
    if (req.user.role !== 'ADMIN' && req.user.role !== 'COMMITTEE') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const overdueBills = await Maintenance.find({ status: 'Pending' });
    const reminders = overdueBills.map(bill => ({
      flatId: bill.flatId,
      amount: bill.amount,
      month: bill.month,
      year: bill.year,
      message: `Friendly reminder: Maintenance for ${bill.month} ${bill.year} is pending for flat ${bill.flatId}.`
    }));

    // In a real app, you'd trigger emails/SMS/FCM here
    console.log(`📢 Generated ${reminders.length} reminders.`);

    res.json({ count: reminders.length, reminders });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to generate reminders' });
  }
});

/**
 * @route   POST /api/v1/payments/dispute-help
 * @desc    AI-powered help for payment disputes
 */
router.post('/dispute-help', protect, async (req: any, res) => {
  try {
    const { transactionId, reason } = req.body;
    const transaction = await Transaction.findById(transactionId).populate('maintenanceId');
    
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    const ai = getAI();
    const model = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are a financial dispute resolution assistant for a residential society named "Saurashtra Residency".
        A resident is disputing a payment.
        
        Transaction Details:
        - ID: ${transaction.gatewayOrderId}
        - Amount: ${transaction.amount} INR
        - Status: ${transaction.status}
        - Date: ${transaction.createdAt}
        - Reason for Dispute: ${reason}
        
        Please provide:
        1. A professional explanation of the transaction status.
        2. Steps the resident should take.
        3. A recommendation for the society committee.
        
        Keep the tone helpful and neutral.
      `,
    });

    const response = await model;
    res.json({ advice: response.text });
  } catch (error: any) {
    console.error('AI Dispute Help failed:', error);
    res.status(500).json({ message: 'AI assistance currently unavailable' });
  }
});

/**
 * @route   POST /api/v1/payments/webhook
 * @desc    Stripe Webhook to handle asynchronous payment success
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    const stripeClient = getStripe();
    event = stripeClient.webhooks.constructEvent(req.body, sig!, endpointSecret!);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    // 1. Update Transaction Status
    const transaction = await Transaction.findOneAndUpdate(
      { gatewayOrderId: paymentIntent.id },
      { status: 'SUCCESS', gatewayPaymentId: paymentIntent.latest_charge as string },
      { new: true }
    );

    if (transaction) {
      // 2. Mark Maintenance Bill as Paid
      await Maintenance.findByIdAndUpdate(transaction.maintenanceId, {
        status: 'Paid',
        paidDate: new Date()
      });
      console.log(`✅ Payment successful for Bill: ${transaction.maintenanceId}`);
    }
  }

  // Handle Subscription Success
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode === 'subscription') {
      const userId = session.metadata?.userId;
      if (userId) {
        await User.findByIdAndUpdate(userId, {
          subscriptionId: session.subscription as string,
          isRecurringEnabled: true
        });
        console.log(`🔁 Recurring payments enabled for user: ${userId}`);
      }
    }
  }

  res.json({ received: true });
});

export default router;
