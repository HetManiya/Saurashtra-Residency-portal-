
import express from 'express';
import Maintenance from '../models/Maintenance';
import Building from '../models/Building';
import Notice from '../models/Notice';
import Visitor from '../models/Visitor';
import { protect, authorize } from '../middleware/authMiddleware';
import { emitVisitorUpdate } from '../socket';

const router = express.Router();

// Get all buildings
router.get('/buildings', protect, async (req, res) => {
  try {
    console.log('🏢 Fetching Buildings...');
    const buildings = await Building.find().sort({ name: 1 });
    res.json(buildings);
  } catch (error: any) {
    console.error('🏢 Fetch Buildings Error:', error.message);
    res.status(500).json({ message: 'Error fetching buildings', error: error.message });
  }
});

// Get all notices
router.get('/notices', protect, async (req, res) => {
  try {
    console.log('📢 Fetching Notices...');
    const { search } = req.query;
    let query: any = {};
    
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { title: searchRegex },
        { content: searchRegex },
        { category: searchRegex }
      ];
    }
    
    const notices = await Notice.find(query).sort({ date: -1 });
    res.json(notices);
  } catch (error: any) {
    console.error('📢 Fetch Notices Error:', error.message);
    res.status(500).json({ message: 'Error fetching notices', error: error.message });
  }
});

// Post a notice (Admin/Committee)
router.post('/notices', protect, authorize(['ADMIN', 'COMMITTEE']), async (req: any, res) => {
  try {
    const notice = new Notice({
      ...req.body,
      author: req.user.id
    });
    await notice.save();
    res.status(201).json(notice);
  } catch (error) {
    res.status(400).json({ message: 'Error creating notice' });
  }
});

// Get all maintenance records (Residents can see their own, Admin sees all)
router.get('/maintenance', protect, async (req: any, res) => {
  try {
    const { flatId, month, year } = req.query;
    let query: any = {};
    
    // If user is resident, strictly restrict to their flatId
    if (req.user.role === 'RESIDENT') {
      query.flatId = req.user.flatId;
    } else if (flatId) {
      query.flatId = flatId;
    }
    
    if (month) query.month = month;
    if (year) query.year = year;

    const records = await Maintenance.find(query).sort({ flatId: 1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching maintenance data' });
  }
});

// GENERATE MONTHLY MAINTENANCE (Admin/Committee)
router.post('/maintenance/generate', protect, authorize(['ADMIN', 'COMMITTEE']), async (req, res) => {
  try {
    const { month, year, amount } = req.body;
    
    const buildings = await Building.find();
    if (buildings.length === 0) {
      return res.status(400).json({ message: 'No buildings found.' });
    }

    const records = [];
    for (const b of buildings) {
      for (let floor = 1; floor <= b.totalFloors; floor++) {
        for (let unit = 1; unit <= b.flatsPerFloor; unit++) {
          const flatNo = floor * 100 + unit;
          records.push({
            flatId: `${b.name}-${flatNo}`,
            month,
            year,
            amount,
            status: 'Pending',
            occupancyType: 'Owner'
          });
        }
      }
    }

    await Maintenance.insertMany(records, { ordered: false });
    res.status(201).json({ message: `Successfully generated records for ${month} ${year}` });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Already generated for this month.' });
    }
    res.status(500).json({ message: 'Generation failed' });
  }
});

// Update maintenance status (Admin/Committee or Resident for their own)
router.patch('/maintenance/:id', protect, async (req: any, res) => {
  try {
    const { status, paidDate } = req.body;
    const record = await Maintenance.findById(req.params.id);
    
    if (!record) return res.status(404).json({ message: 'Record not found' });

    // Authorization: Admin/Committee can update any record.
    const isAdmin = ['ADMIN', 'COMMITTEE'].includes(req.user.role);

    if (!isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to update this record.' });
    }

    // Update the record
    record.status = status;
    if (status === 'Paid') {
      record.paidDate = paidDate || new Date();
    } else {
      record.paidDate = undefined;
    }

    await record.save();
    res.json(record);
  } catch (error) {
    res.status(400).json({ message: 'Update failed' });
  }
});

// Calculate Penalties (Admin/Committee)
router.post('/maintenance/calculate-penalties', protect, authorize(['ADMIN', 'COMMITTEE']), async (req, res) => {
  try {
    const { month, year, penaltyRate = 100 } = req.body;
    const overdueRecords = await Maintenance.find({ 
      month, 
      year, 
      status: 'Pending' 
    });

    for (const record of overdueRecords) {
      record.status = 'Overdue';
      record.penaltyAmount = penaltyRate;
      await record.save();
    }

    res.json({ message: `Calculated penalties for ${overdueRecords.length} records.` });
  } catch (error) {
    res.status(500).json({ message: 'Penalty calculation failed' });
  }
});

// Get Receipt Data
router.get('/maintenance/:id/receipt', protect, async (req: any, res) => {
  try {
    const record = await Maintenance.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    
    // Authorization check
    if (req.user.role === 'RESIDENT' && record.flatId !== req.user.flatId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const receipt = {
      receiptNo: `SR-${record._id.toString().substring(0, 8).toUpperCase()}`,
      flatId: record.flatId,
      period: `${record.month} ${record.year}`,
      amount: record.amount,
      penalty: record.penaltyAmount,
      total: record.amount + record.penaltyAmount,
      status: record.status,
      paidDate: record.paidDate,
      societyName: 'Saurashtra Residency',
      address: 'Pasodara, Surat, Gujarat 395006'
    };

    res.json(receipt);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch receipt' });
  }
});

// --- VISITOR MANAGEMENT ---

// Generate Visitor Pass
router.post('/visitors/generate', protect, async (req: any, res) => {
  try {
    const passId = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Ensure residents can only generate passes for their own flat
    const flatId = req.user.role === 'RESIDENT' ? req.user.flatId : (req.body.flatId || req.user.flatId);

    const visitor = new Visitor({
      ...req.body,
      flatId,
      passId,
      status: 'PENDING'
    });
    await visitor.save();
    res.status(201).json(visitor);
  } catch (error) {
    res.status(400).json({ message: 'Failed to generate pass' });
  }
});

// Verify Visitor Pass
router.get('/visitors/verify/:passId', protect, async (req, res) => {
  try {
    const visitor = await Visitor.findOne({ passId: req.params.passId.toUpperCase() });
    if (!visitor) return res.status(404).json({ message: 'Invalid Pass ID' });
    res.json(visitor);
  } catch (error) {
    res.status(500).json({ message: 'Verification failed' });
  }
});

// Check-In Visitor
router.post('/visitors/check-in/:passId', protect, authorize(['ADMIN', 'COMMITTEE', 'SECURITY']), async (req, res) => {
  try {
    const visitor = await Visitor.findOne({ passId: req.params.passId.toUpperCase() });
    if (!visitor) return res.status(404).json({ message: 'Invalid Pass ID' });
    if (visitor.status === 'IN') return res.status(400).json({ message: 'Visitor already checked in' });

    visitor.status = 'IN';
    visitor.checkInTime = new Date();
    await visitor.save();
    
    // Emit real-time update
    emitVisitorUpdate({ type: 'CHECK_IN', visitor });
    
    res.json(visitor);
  } catch (error) {
    res.status(500).json({ message: 'Check-in failed' });
  }
});

// Check-Out Visitor
router.post('/visitors/check-out/:id', protect, authorize(['ADMIN', 'COMMITTEE', 'SECURITY']), async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' });
    if (visitor.status === 'OUT') return res.status(400).json({ message: 'Visitor already checked out' });

    visitor.status = 'OUT';
    visitor.checkOutTime = new Date();
    await visitor.save();
    
    // Emit real-time update
    emitVisitorUpdate({ type: 'CHECK_OUT', visitor });
    
    res.json(visitor);
  } catch (error) {
    res.status(500).json({ message: 'Check-out failed' });
  }
});

// Get Active Visitors
router.get('/visitors/active', protect, authorize(['ADMIN', 'COMMITTEE', 'SECURITY']), async (req, res) => {
  try {
    const active = await Visitor.find({ status: 'IN' }).sort({ checkInTime: -1 });
    res.json(active);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch active visitors' });
  }
});

// Get Visitor History
router.get('/visitors/history', protect, async (req: any, res) => {
  try {
    const { startDate, endDate, search } = req.query;
    let query: any = {};

    // If user is resident, restrict to their flatId unless they are admin/security
    if (req.user.role === 'RESIDENT') {
      query.flatId = req.user.flatId;
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { flatId: searchRegex }
      ];
    }

    const history = await Visitor.find(query).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch visitor history' });
  }
});

// Get Visitor Analytics
router.get('/visitors/analytics', protect, authorize(['ADMIN', 'COMMITTEE', 'SECURITY']), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyVisitors = await Visitor.countDocuments({
      checkInTime: { $gte: today }
    });

    const frequentVisitors = await Visitor.aggregate([
      { $match: { status: { $in: ['IN', 'OUT'] } } },
      { $group: { _id: "$phone", name: { $first: "$name" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Calculate average stay duration for today
    const todayVisitors = await Visitor.find({
      checkInTime: { $gte: today },
      status: 'OUT'
    });

    let totalDuration = 0;
    let avgStayDuration = 0;
    if (todayVisitors.length > 0) {
      todayVisitors.forEach(v => {
        if (v.checkInTime && v.checkOutTime) {
          totalDuration += (v.checkOutTime.getTime() - v.checkInTime.getTime());
        }
      });
      avgStayDuration = Math.round(totalDuration / todayVisitors.length / 60000); // in minutes
    }

    res.json({
      dailyVisitors,
      frequentVisitors,
      avgStayDuration
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

export default router;
