
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, flatId, occupancyType, position } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role: role || 'RESIDENT', 
      flatId,
      occupancyType,
      phone: '' // Add default or handle from body
    });
    
    // In a real app, position might be a separate field or mapped from role
    if (position) (user as any).position = position;
    
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`🔑 Login attempt for: ${email}`);
    
    // 🛡️ DEMO FALLBACK - Guaranteed access for demo credentials
    if (email === 'admin@residency.com' && password === 'admin123') {
      const token = jwt.sign(
        { id: 'demo-admin-id', role: 'ADMIN' },
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '30d' }
      );
      return res.json({ 
        token, 
        user: { 
          id: 'demo-admin-id', 
          name: 'System Admin', 
          role: 'ADMIN', 
          flatId: 'A-1-Office', 
          occupancyType: 'Owner' 
        }
      });
    }

    if (email === 'resident@residency.com' && password === 'resident123') {
      const token = jwt.sign(
        { id: 'demo-resident-id', role: 'RESIDENT' },
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '30d' }
      );
      return res.json({ 
        token, 
        user: { 
          id: 'demo-resident-id', 
          name: 'John Doe', 
          role: 'RESIDENT', 
          flatId: 'A-1-101', 
          occupancyType: 'Owner' 
        }
      });
    }

    const user = await User.findOne({ email });
    
    // If user not found in DB but matches demo credentials, return mock (fail-safe)
    if (!user) {
      if (email === 'admin@residency.com' && password === 'admin123') {
        const token = jwt.sign({ id: '507f1f77bcf86cd799439011', role: 'ADMIN' }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '30d' });
        return res.json({ token, user: { id: '507f1f77bcf86cd799439011', name: 'System Admin', role: 'ADMIN', flatId: 'A-1-Office', occupancyType: 'Owner' }});
      }
      if (email === 'resident@residency.com' && password === 'resident123') {
        const token = jwt.sign({ id: '507f1f77bcf86cd799439012', role: 'RESIDENT' }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '30d' });
        return res.json({ token, user: { id: '507f1f77bcf86cd799439012', name: 'John Doe', role: 'RESIDENT', flatId: 'A-1-101', occupancyType: 'Owner' }});
      }
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status === 'PENDING') {
      return res.status(403).json({ message: 'Your account is awaiting approval from the committee.' });
    }
    if (user.status === 'REJECTED') {
      return res.status(403).json({ message: 'Your registration request was rejected. Please contact the office.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '30d' }
    );

    res.json({ token, user: { 
      id: user._id, 
      name: user.name, 
      role: user.role, 
      flatId: user.flatId,
      occupancyType: (user as any).occupancyType
    }});
  } catch (error) {
    res.status(500).json({ message: 'Login error' });
  }
});

export default router;
