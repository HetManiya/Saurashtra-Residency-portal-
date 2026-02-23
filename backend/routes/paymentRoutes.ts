import express from 'express';
import Stripe from 'stripe';
import { protect } from '../middleware/authMiddleware';
import Maintenance from '../models/Maintenance';
import Transaction from '../models/Transaction';

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

    res.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      amount: bill.amount,
      currency: 'INR'
    });
  } catch (error: any) {
    console.error('Payment order creation failed:', error);
    res.status(500).json({ message: error.message || 'Payment initialization failed' });
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

  res.json({ received: true });
});

export default router;
