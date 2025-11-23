import express from 'express';
const router = express.Router();
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import Task from '../models/Task.js';

router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({ active: true }).select('-password').sort({ createdAt: -1 });
    res.json(users.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      avatarUrl: u.avatarUrl,
      createdAt: u.createdAt.toISOString(),
      active: u.active,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/invite', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { email, role } = req.body;
    
    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    res.json({ success: true, message: 'Invite sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const userId = req.params.id;
    
    await User.findByIdAndUpdate(userId, { active: false });
    
    await Task.updateMany(
      { assignedTo: userId },
      { $pull: { assignedTo: userId } }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

