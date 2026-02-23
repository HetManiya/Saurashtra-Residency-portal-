import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  maintenanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Maintenance', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { 
    type: String, 
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'], 
    default: 'PENDING' 
  },
  paymentGateway: { type: String, default: 'Stripe' },
  gatewayOrderId: { type: String, required: true }, // Stripe PaymentIntent ID
  gatewayPaymentId: { type: String },
  gatewaySignature: { type: String },
  metadata: { type: Object }
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);
