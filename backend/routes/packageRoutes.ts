
import express from 'express';
import Package from '../models/Package';
import User from '../models/User';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Get packages (Residents see their own, Admin/Security see all)
router.get('/', protect, async (req: any, res) => {
  try {
    let query: any = {};
    if (req.user.role === 'RESIDENT') {
      query.flatId = req.user.flatId;
    }
    
    const packages = await Package.find(query).sort({ receivedAt: -1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch packages' });
  }
});

// Log new package (Admin/Committee/Security)
router.post('/', protect, authorize(['ADMIN', 'COMMITTEE']), async (req: any, res) => {
  try {
    const { flatId, carrier, trackingNumber, notes } = req.body;
    
    // Find resident name for convenience
    const resident = await User.findOne({ flatId, role: 'RESIDENT' });
    
    const newPackage = new Package({
      flatId,
      residentName: resident ? resident.name : 'Unknown Resident',
      carrier,
      trackingNumber,
      notes,
      receivedBy: req.user.id
    });
    
    await newPackage.save();
    res.status(201).json(newPackage);
  } catch (error) {
    res.status(400).json({ message: 'Failed to log package' });
  }
});

// Mark as collected
router.patch('/:id/collect', protect, async (req: any, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    
    // Authorization: Admin/Committee or the resident themselves
    const isAdmin = ['ADMIN', 'COMMITTEE'].includes(req.user.role);
    const isOwner = pkg.flatId === req.user.flatId;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    pkg.status = 'COLLECTED';
    pkg.collectedAt = new Date();
    await pkg.save();
    
    res.json(pkg);
  } catch (error) {
    res.status(400).json({ message: 'Update failed' });
  }
});

// Delete package log (Admin only)
router.delete('/:id', protect, authorize(['ADMIN']), async (req, res) => {
  try {
    await Package.findByIdAndDelete(req.params.id);
    res.json({ message: 'Package log deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

export default router;
