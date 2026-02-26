import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
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

import { MongoMemoryServer } from 'mongodb-memory-server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Database Connection
let isConnecting = false;
export const connectDB = async () => {
  if (isConnecting || mongoose.connection.readyState === 1) return;
  isConnecting = true;
  
  let MONGODB_URI = process.env.MONGODB_URI;
  try {
    if (!MONGODB_URI || MONGODB_URI.includes('localhost')) {
      console.log('🧪 Starting In-Memory MongoDB for Demo...');
      try {
        const mongod = await MongoMemoryServer.create({
          instance: { dbName: 'saurashtra_residency' },
          binary: { version: '6.0.4' }
        });
        MONGODB_URI = mongod.getUri();
      } catch (memErr) {
        console.error('❌ MongoMemoryServer failed to start:', memErr);
        MONGODB_URI = 'mongodb://127.0.0.1:27017/saurashtra_residency';
      }
    }
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log('✅ MongoDB Connected');
    await initializeData();
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
  } finally {
    isConnecting = false;
  }
};

async function initializeData() {
  try {
    await initializeInfrastructure();
    await seedUsers();
    await seedDashboardData();
    await seedAmenities();
  } catch (err) {
    console.error('❌ Data Seeding Error:', err);
  }
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

// connectDB(); // Removed top-level call to prevent connection during build

// Request Logging Middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`📡 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

app.use(cors());
app.use(express.json());

// Middleware to ensure DB is connected before processing API requests
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  
  if (mongoose.connection.readyState !== 1) {
    console.log(`⏳ API Request ${req.path} waiting for DB connection (Current state: ${mongoose.connection.readyState})...`);
    res.setHeader('Content-Type', 'application/json');
    return res.status(503).json({ 
      message: 'Database is initializing, please refresh in a few seconds.',
      state: mongoose.connection.readyState 
    });
  }
  next();
});

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

// 404 Handler for API - Ensure it catches everything under /api
app.use('/api', (req, res) => {
  console.warn(`🔍 404 API Route Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    message: `API Route ${req.originalUrl} not found`,
    method: req.method,
    originalUrl: req.originalUrl
  });
});

// Global Error Handler for API
app.use((err: any, req: any, res: any, next: any) => {
  console.error('❌ Global API Error:', err);
  if (req.originalUrl && req.originalUrl.startsWith('/api')) {
    return res.status(500).json({ 
      message: 'Internal Server Error', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
  next(err);
});

export default app;
