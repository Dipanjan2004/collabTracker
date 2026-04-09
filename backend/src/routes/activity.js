import express from 'express';
const router = express.Router();
import { auth } from '../middleware/auth.js';
import Activity from '../models/Activity.js';

router.get('/', auth, async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate('userId', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    res.json(activities.map(a => ({
      id: a._id.toString(),
      userId: a.userId._id.toString(),
      userName: a.userName,
      action: a.action,
      targetType: a.targetType,
      targetId: a.targetId,
      createdAt: a.createdAt.toISOString(),
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/task/:taskId', auth, async (req, res) => {
  try {
    const activities = await Activity.find({
      targetType: 'task',
      targetId: req.params.taskId,
    })
      .populate('userId', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    res.json(activities.map(a => ({
      id: a._id.toString(),
      userId: a.userId._id.toString(),
      userName: a.userName,
      action: a.action,
      targetType: a.targetType,
      targetId: a.targetId,
      createdAt: a.createdAt.toISOString(),
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/user/:userId', auth, async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.params.userId })
      .populate('userId', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    res.json(activities.map(a => ({
      id: a._id.toString(),
      userId: a.userId._id.toString(),
      userName: a.userName,
      action: a.action,
      targetType: a.targetType,
      targetId: a.targetId,
      createdAt: a.createdAt.toISOString(),
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

