
import express from 'express';
import Maintenance from '../models/Maintenance';
import Building from '../models/Building';
import Notice from '../models/Notice';
import { protect, authorize } from '../middleware/authMiddleware';

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
    const notices = await Notice.find().sort({ date: -1 });
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
    
    // If user is resident, restrict to their flatId unless they are admin
    if (req.user.role === 'RESIDENT' && !flatId) {
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

    // Authorization: Admin/Committee can update any record. Residents can only update their own.
    const isAdmin = ['ADMIN', 'COMMITTEE'].includes(req.user.role);
    const isOwner = record.flatId === req.user.flatId;

    if (!isAdmin && !isOwner) {
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

export default router;
