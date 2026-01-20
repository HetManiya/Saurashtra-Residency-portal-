
import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
  flatId: { type: String, required: true, index: true }, // Wing-Flat (e.g., A-1-101)
  month: { type: String, required: true }, // e.g., 'May'
  year: { type: Number, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' },
  occupancyType: { type: String, enum: ['Owner', 'Tenant'], required: true },
  paidDate: { type: Date },
  lastReminderSent: { type: Date }
}, { timestamps: true });

// Ensure unique record per flat per month
maintenanceSchema.index({ flatId: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model('Maintenance', maintenanceSchema);
