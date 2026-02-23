import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes';
import societyRoutes from './routes/societyRoutes';
import expenseRoutes from './routes/expenseRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import paymentRoutes from './routes/paymentRoutes';
import adminRoutes from './routes/adminRoutes';
import Building from './models/Building';
import User from './models/User';
import Notice from './models/Notice';
import Maintenance from './models/Maintenance';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Database Connection
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/saurashtra_residency';
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('✅ MongoDB Connected');
      initializeData();
    })
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

  async function initializeData() {
    await initializeInfrastructure();
    await seedUsers();
    await seedDashboardData();
  }

  async function seedDashboardData() {
    const noticeCount = await Notice.countDocuments();
    if (noticeCount === 0) {
      console.log('📢 Seeding default notices...');
      await Notice.create([
        {
          title: 'Annual General Meeting',
          content: 'The AGM is scheduled for next Sunday at 10:00 AM in the clubhouse.',
          category: 'Event'
        },
        {
          title: 'Water Supply Maintenance',
          content: 'There will be a temporary water supply cut this Tuesday from 2 PM to 5 PM.',
          category: 'Urgent'
        }
      ]);
    }

    const maintenanceCount = await Maintenance.countDocuments();
    if (maintenanceCount === 0) {
      console.log('💰 Seeding default maintenance records...');
      await Maintenance.create([
        {
          flatId: 'A-1-101',
          month: 'February',
          year: 2026,
          amount: 2500,
          status: 'Pending',
          occupancyType: 'Owner'
        },
        {
          flatId: 'A-1-101',
          month: 'January',
          year: 2026,
          amount: 2500,
          status: 'Paid',
          occupancyType: 'Owner',
          paidDate: new Date()
        }
      ]);
    }
  }

  async function initializeInfrastructure() {
    const count = await Building.countDocuments();
    if (count === 0) {
      console.log('🏗️ Initializing Society Infrastructure (24 Wings)...');
      const wings = [];
      for (let i = 1; i <= 24; i++) {
        wings.push({
          name: `A-${i}`,
          type: i <= 6 ? '1BHK' : '2BHK',
          totalFloors: 5,
          flatsPerFloor: 4
        });
      }
      await Building.insertMany(wings);
      console.log('✅ Infrastructure ready.');
    }
  }

  async function seedUsers() {
    const adminEmail = 'admin@residency.com';
    const residentEmail = 'resident@residency.com';

    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      console.log('👤 Seeding default Admin user...');
      const hashedAdminPassword = await bcrypt.hash('admin123', 12);
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: hashedAdminPassword,
        role: 'ADMIN',
        occupancyType: 'Owner',
        flatId: 'A-1-Office',
        phone: '9999999999',
        status: 'APPROVED'
      });
    }

    const residentExists = await User.findOne({ email: residentEmail });
    if (!residentExists) {
      console.log('👤 Seeding default Resident user...');
      const hashedResidentPassword = await bcrypt.hash('resident123', 12);
      await User.create({
        name: 'John Doe',
        email: residentEmail,
        password: hashedResidentPassword,
        role: 'RESIDENT',
        occupancyType: 'Owner',
        flatId: 'A-1-101',
        phone: '8888888888',
        status: 'APPROVED'
      });
    }
  }

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/society', societyRoutes);
  app.use('/api/expenses', expenseRoutes);
  app.use('/api/v1/dashboard', dashboardRoutes);
  app.use('/api/v1/payments', paymentRoutes);
  app.use('/api/v1/admin', adminRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, '../dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
