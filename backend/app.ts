import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import authRoutes from './routes/authRoutes';
import societyRoutes from './routes/societyRoutes';
import expenseRoutes from './routes/expenseRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import paymentRoutes from './routes/paymentRoutes';
import adminRoutes from './routes/adminRoutes';
import meetingRoutes from './routes/meetingRoutes';
import amenityRoutes from './routes/amenityRoutes';
import auditRoutes from './routes/auditRoutes';
import packageRoutes from './routes/packageRoutes';
import notificationRoutes from './routes/notificationRoutes';
import Building from './models/Building';
import User from './models/User';
import Notice from './models/Notice';
import Maintenance from './models/Maintenance';
import Amenity from './models/Amenity';
import Meeting from './models/Meeting';
import Expense from './models/Expense';
import Fund from './models/Fund';
import Complaint from './models/Complaint';
import Visitor from './models/Visitor';
import Package from './models/Package';
import AuditLog from './models/AuditLog';

dotenv.config();

// Disable buffering to avoid 10s timeouts when connection is not ready
mongoose.set('bufferCommands', false);

const app = express();

// Database Connection
let connectionPromise: Promise<void> | null = null;
let mongoServer: MongoMemoryServer | null = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  if (connectionPromise) return connectionPromise;

  connectionPromise = (async () => {
    let MONGODB_URI = process.env.MONGODB_URI;
    
    // Validate URI
    const isValidUri = (uri: string | undefined) => 
      uri && (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'));

    try {
      if (!isValidUri(MONGODB_URI)) {
        console.warn('⚠️ MONGODB_URI missing or invalid. Starting In-Memory MongoDB...');
        if (!mongoServer) {
          mongoServer = await MongoMemoryServer.create();
        }
        MONGODB_URI = mongoServer.getUri();
        console.log(`🧠 In-Memory MongoDB started at: ${MONGODB_URI}`);
      }
      
      console.log('🔌 Connecting to MongoDB...');
      await mongoose.connect(MONGODB_URI!, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      console.log('✅ MongoDB Connected');
      await initializeData();
    } catch (err) {
      console.error('❌ MongoDB Connection Error:', err);
      connectionPromise = null; // Reset so we can try again
      throw err;
    }
  })();

  return connectionPromise;
};

async function initializeData() {
  try {
    await initializeInfrastructure();
    await seedUsers();
    await seedDashboardData();
    await seedAmenities();
    await seedExpenses();
    await seedFunds();
    await seedComplaints();
    await seedVisitorsAndPackages();
    await seedAuditLogs();
  } catch (err) {
    console.error('❌ Data Seeding Error:', err);
  }
}

async function seedAmenities() {
  const count = await Amenity.countDocuments();
  if (count === 0) {
    console.log('🏊 Seeding default amenities...');
    const amenities = await Amenity.create([
      { name: 'Clubhouse', description: 'Spacious hall for events and gatherings', capacity: 100, hourlyRate: 500, photoUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800' },
      { name: 'Swimming Pool', description: 'Olympic size pool with clean water', capacity: 20, hourlyRate: 100, photoUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=800' },
      { name: 'Gymnasium', description: 'Fully equipped modern gym', capacity: 15, hourlyRate: 50, photoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800' },
      { name: 'Tennis Court', description: 'Professional grade tennis court', capacity: 4, hourlyRate: 200, photoUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=800' }
    ]);
    
    // Seed Bookings
    const user = await User.findOne({ role: 'RESIDENT' });
    if (user && amenities.length > 0) {
      const AmenityBooking = (await import('./models/AmenityBooking')).default;
      await AmenityBooking.create([
        { amenityId: amenities[0]._id, userId: user._id, flatId: user.flatId, date: new Date(Date.now() + 86400000 * 2), startTime: '18:00', endTime: '22:00', duration: 4, purpose: 'Birthday Party', status: 'APPROVED', totalAmount: 2000 },
        { amenityId: amenities[1]._id, userId: user._id, flatId: user.flatId, date: new Date(Date.now() + 86400000 * 5), startTime: '08:00', endTime: '10:00', duration: 2, purpose: 'Morning Swim', status: 'PENDING', totalAmount: 200 },
        { amenityId: amenities[2]._id, userId: user._id, flatId: user.flatId, date: new Date(Date.now() - 86400000 * 1), startTime: '18:00', endTime: '19:00', duration: 1, purpose: 'Workout', status: 'COMPLETED', totalAmount: 50 },
        { amenityId: amenities[3]._id, userId: user._id, flatId: user.flatId, date: new Date(Date.now() + 86400000 * 10), startTime: '16:00', endTime: '18:00', duration: 2, purpose: 'Tennis Match', status: 'APPROVED', totalAmount: 400 }
      ]);
    }
  }
}

async function seedDashboardData() {
  const noticeCount = await Notice.countDocuments();
  if (noticeCount === 0) {
    console.log('📢 Seeding default notices...');
    await Notice.create([
      {
        title: 'Annual General Meeting',
        content: 'The AGM is scheduled for next Sunday at 10:00 AM in the clubhouse. All owners are requested to attend.',
        category: 'Event',
        date: new Date()
      },
      {
        title: 'Water Supply Maintenance',
        content: 'There will be a temporary water supply cut this Tuesday from 2 PM to 5 PM due to overhead tank cleaning.',
        category: 'Urgent',
        date: new Date(Date.now() - 86400000)
      },
      {
        title: 'New Gym Equipment Installed',
        content: 'We have added two new treadmills and a multi-gym station. Please use them responsibly.',
        category: 'General',
        date: new Date(Date.now() - 86400000 * 3)
      },
      {
        title: 'Pest Control Drive',
        content: 'Quarterly pest control will be conducted in all common areas and basements this weekend.',
        category: 'General',
        date: new Date(Date.now() - 86400000 * 5)
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
      },
      {
        title: 'Annual General Meeting 2026',
        description: 'Yearly review of society finances and election of new committee members.',
        date: new Date(Date.now() + 86400000 * 15), // 15 days from now
        location: 'Central Party Plot',
        type: 'AGM'
      },
      {
        title: 'Holi Preparation Sync',
        description: 'Planning the upcoming Holi event, budget allocation, and volunteer assignments.',
        date: new Date(Date.now() - 86400000 * 5), // 5 days ago
        location: 'Clubhouse',
        type: 'FESTIVAL'
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
    
    // Add more residents
    await User.create([
      {
        name: 'Priya Patel',
        email: 'priya@residency.com',
        password: hashedResidentPassword,
        role: 'RESIDENT',
        occupancyType: 'Owner',
        flatId: 'A-5-204',
        phone: '9876543210',
        status: 'APPROVED'
      },
      {
        name: 'Amit Kumar',
        email: 'amit@residency.com',
        password: hashedResidentPassword,
        role: 'RESIDENT',
        occupancyType: 'Tenant',
        flatId: 'A-12-302',
        phone: '9876543211',
        status: 'APPROVED'
      },
      {
        name: 'Neha Sharma',
        email: 'neha@residency.com',
        password: hashedResidentPassword,
        role: 'RESIDENT',
        occupancyType: 'Owner',
        flatId: 'A-2-401',
        phone: '9876543212',
        status: 'APPROVED'
      }
    ]);
  }
}

async function seedExpenses() {
  if (await Expense.countDocuments() === 0) {
    console.log('💸 Seeding expenses...');
    await Expense.create([
      { type: 'SECURITY', payeeName: 'Eagle Eye Security', amount: 45000, status: 'Paid', date: new Date(), details: { remarks: 'Monthly payout', gateNumber: 'Gate 1', shift: 'Day' } },
      { type: 'BUILDING_CLEANING', payeeName: 'Sparkle Cleaners', amount: 15000, status: 'Paid', date: new Date(), details: { remarks: 'Common area cleaning', buildingName: 'A-1' } },
      { type: 'GARBAGE', payeeName: 'SMC Waste Mgmt', amount: 5000, status: 'Pending', date: new Date(), details: { remarks: 'Quarterly fee' } },
      { type: 'SECURITY', payeeName: 'Night Watchers', amount: 25000, status: 'Paid', date: new Date(Date.now() - 86400000 * 10), details: { remarks: 'Night shift security', gateNumber: 'Gate 2', shift: 'Night' } }
    ]);
  }
}

async function seedFunds() {
  if (await Fund.countDocuments() === 0) {
    console.log('💰 Seeding funds...');
    await Fund.create([
      { purpose: 'Navratri Mahotsav 2026', date: new Date(), targetAmount: 50000, totalCollected: 35000, status: 'Active' },
      { purpose: 'Ganesh Chaturthi', date: new Date(Date.now() - 86400000 * 30), targetAmount: 20000, totalCollected: 20000, status: 'Completed' },
      { purpose: 'Lift Repair Fund', date: new Date(), targetAmount: 150000, totalCollected: 120000, status: 'Active' }
    ]);
  }
}

async function seedComplaints() {
  if (await Complaint.countDocuments() === 0) {
    console.log('📝 Seeding complaints...');
    const user = await User.findOne({ role: 'RESIDENT' });
    if (user) {
      await Complaint.create([
        { userId: user._id, flatId: user.flatId, subject: 'Water leakage in A-2 parking', description: 'Continuous dripping from the overhead pipe.', status: 'OPEN', priority: 'HIGH' },
        { userId: user._id, flatId: user.flatId, subject: 'Street light not working', description: 'The light pole near B-wing is flickering.', status: 'RESOLVED', priority: 'MEDIUM' },
        { userId: user._id, flatId: user.flatId, subject: 'Noise complaint', description: 'Loud music from A-3 after 11 PM.', status: 'IN_PROGRESS', priority: 'LOW' }
      ]);
    }
  }
}

async function seedVisitorsAndPackages() {
  if (await Visitor.countDocuments() === 0) {
    console.log('🚶 Seeding visitors...');
    await Visitor.create([
      { name: 'Rahul Sharma', phone: '9876543210', flatId: 'A-1-101', purpose: 'Guest', type: 'GUEST', status: 'IN', checkInTime: new Date(), passId: 'VIS123' },
      { name: 'Urban Company', phone: '9876543211', flatId: 'A-2-202', purpose: 'AC Repair', type: 'SERVICE', status: 'OUT', checkInTime: new Date(Date.now() - 7200000), checkOutTime: new Date(Date.now() - 3600000), passId: 'VIS124' }
    ]);
  }

  if (await Package.countDocuments() === 0) {
    console.log('📦 Seeding packages...');
    await Package.create([
      { flatId: 'A-1-101', carrier: 'Amazon', trackingNumber: 'AMZ123456', status: 'AT_GATE', residentName: 'John Doe', receivedAt: new Date() },
      { flatId: 'A-3-304', carrier: 'Flipkart', trackingNumber: 'FLIP7890', status: 'COLLECTED', residentName: 'Jane Smith', receivedAt: new Date(Date.now() - 86400000), collectedAt: new Date(Date.now() - 80000000) },
      { flatId: 'A-2-202', carrier: 'Zomato', status: 'AT_GATE', residentName: 'Rahul Verma', receivedAt: new Date() }
    ]);
  }
}

async function seedAuditLogs() {
  if (await AuditLog.countDocuments() === 0) {
    console.log('📜 Seeding audit logs...');
    await AuditLog.create([
      { userId: 'system', userName: 'System', action: 'STARTUP', entity: 'SYSTEM', details: 'Society digital portal initialized', timestamp: new Date() },
      { userId: '507f1f77bcf86cd799439011', userName: 'System Admin', action: 'APPROVE_USER', entity: 'User', details: 'Approved registration for John Doe', timestamp: new Date(Date.now() - 86400000) },
      { userId: '507f1f77bcf86cd799439011', userName: 'System Admin', action: 'LOG_EXPENSE', entity: 'Expense', details: 'Logged 45000 for Security', timestamp: new Date(Date.now() - 43200000) }
    ]);
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
app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/payments/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Ensure DB connection for every request
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') && mongoose.connection.readyState !== 1) {
    await connectDB();
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
app.use('/api/society/packages', packageRoutes);
app.use('/api/v1/notifications', notificationRoutes);

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
