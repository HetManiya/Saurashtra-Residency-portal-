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
import meetingRoutes from './routes/meetingRoutes';
import amenityRoutes from './routes/amenityRoutes';
import auditRoutes from './routes/auditRoutes';
import Building from './models/Building';
import User from './models/User';
import Notice from './models/Notice';
import Maintenance from './models/Maintenance';
import Amenity from './models/Amenity';
import Meeting from './models/Meeting';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🏁 Starting backend/server.ts...');

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`📡 Health check: http://0.0.0.0:${PORT}/api/health`);
  });

  app.get('/test-server', (req, res) => res.send('Server is alive!'));

  app.use(cors());
  app.use(express.json());

  // Database Connection (Non-blocking for server start)
  const connectDB = async () => {
    let MONGODB_URI = process.env.MONGODB_URI;
    try {
      if (!MONGODB_URI || MONGODB_URI.includes('localhost')) {
        console.log('🧪 MONGODB_URI not found or local. Attempting to use existing MongoDB or skipping memory server for stability...');
        // If we really need a DB for the demo and none is provided, 
        // we'll try MongoMemoryServer but with a timeout
        if (!MONGODB_URI) {
           console.log('⚠️ No MONGODB_URI provided. Server will run but DB operations will fail until connected.');
           return;
        }
      }

      console.log('🔌 Connecting to MongoDB...');
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('✅ MongoDB Connected');
      await initializeData();
    } catch (err) {
      console.error('❌ MongoDB Connection Error:', err);
    }
  };

  // Start DB connection in background
  connectDB();

  async function initializeData() {
    await initializeInfrastructure();
    await seedUsers();
    await seedDashboardData();
    await seedAmenities();
  }

  async function seedAmenities() {
    const count = await Amenity.countDocuments();
    if (count === 0) {
      console.log('🏊 Seeding default amenities...');
      await Amenity.create([
        { name: 'Clubhouse', description: 'Spacious hall for events and gatherings', capacity: 100, hourlyRate: 500 },
        { name: 'Swimming Pool', description: 'Olympic size pool with clean water', capacity: 20, hourlyRate: 100 },
        { name: 'Gymnasium', description: 'Fully equipped modern gym', capacity: 15, hourlyRate: 50 },
        { name: 'Tennis Court', description: 'Professional grade tennis court', capacity: 4, hourlyRate: 200 }
      ]);
    }
  }

  async function seedDashboardData() {
    const noticeCount = await Notice.countDocuments();
    if (noticeCount === 0) {
      console.log('📢 Seeding default notices...');
      await Notice.create([
        {
          title: 'Annual General Meeting',
          content: 'The AGM is scheduled for next Sunday at 10:00 AM in the clubhouse.',
          category: 'Event',
          date: new Date()
        },
        {
          title: 'Water Supply Maintenance',
          content: 'There will be a temporary water supply cut this Tuesday from 2 PM to 5 PM.',
          category: 'Urgent',
          date: new Date()
        }
      ]);
    }

    const meetingCount = await Meeting.countDocuments();
    if (meetingCount === 0) {
      console.log('📅 Seeding default meetings...');
      await Meeting.create([
        {
          title: 'Security Review Meeting',
          description: 'Discussion on new security protocols and CCTV installation.',
          date: new Date(Date.now() + 86400000 * 2), // 2 days from now
          location: 'Conference Room A',
          type: 'COMMITTEE'
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
        _id: '507f1f77bcf86cd799439011',
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
        _id: '507f1f77bcf86cd799439012',
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
  app.use('/api/v1/meetings', meetingRoutes);
  app.use('/api/v1/amenities', amenityRoutes);
  app.use('/api/v1/audit', auditRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', db: mongoose.connection.readyState });
  });

  // 404 Handler for API
  app.use('/api/*', (req, res) => {
    console.warn(`⚠️ 404 Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
  });

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('🔥 Global Error:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    console.log('🛠️ Initializing Vite development server...');
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
        root: path.resolve(__dirname, '..'),
      });
      app.use(vite.middlewares);
      console.log('✅ Vite middleware integrated');
    } catch (viteErr) {
      console.error('❌ Vite Initialization Error:', viteErr);
    }
  } else {
    app.use(express.static(path.join(__dirname, '../dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
  }
}

startServer();
