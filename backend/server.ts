
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import authRoutes from './routes/authRoutes';
import societyRoutes from './routes/societyRoutes';
import expenseRoutes from './routes/expenseRoutes';
import Building from './models/Building';
import User from './models/User';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Production CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL || ''
].filter(origin => origin !== '');

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

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
}

// Initial setup logic for the 24 buildings of Saurashtra Residency
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

// Seed default users for testing
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
      flatId: 'A-1-Office'
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
      flatId: 'A-1-101'
    });
  }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/society', societyRoutes);
app.use('/api/expenses', expenseRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Saurashtra Residency API is operational',
    version: '1.0.0',
    status: 'online'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
