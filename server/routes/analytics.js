import express from 'express';
const router = express.Router();
import { auth } from '../middleware/auth.js';
import Task from '../models/Task.js';
import ProgressLog from '../models/ProgressLog.js';
import User from '../models/User.js';

router.get('/overview', auth, async (req, res) => {
  try {
    const { range = 'week' } = req.query;
    
    const tasks = await Task.find({ archived: false });
    const progress = await ProgressLog.find();
    const users = await User.find({ role: 'collaborator', active: true });

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentProgress = progress.filter(p => new Date(p.createdAt) > weekAgo);

    const weeklyHoursData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayProgress = progress.filter(p => {
        const pDate = new Date(p.createdAt);
        return pDate.toDateString() === date.toDateString();
      });
      const hours = dayProgress.reduce((sum, p) => sum + p.hoursSpent, 0);
      weeklyHoursData.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        hours: Math.round(hours * 10) / 10,
      });
    }

    const taskStatusDistribution = [
      {
        status: 'To Do',
        count: tasks.filter(t => t.status === 'todo').length,
        collaborators: [],
      },
      {
        status: 'In Progress',
        count: tasks.filter(t => t.status === 'in-progress').length,
        collaborators: [],
      },
      {
        status: 'Review',
        count: tasks.filter(t => t.status === 'review').length,
        collaborators: [],
      },
      {
        status: 'Done',
        count: tasks.filter(t => t.status === 'done').length,
        collaborators: [],
      },
      {
        status: 'Blocked',
        count: tasks.filter(t => t.status === 'blocked').length,
        collaborators: [],
      },
    ].filter(item => item.count > 0);

    for (const item of taskStatusDistribution) {
      const statusTasks = tasks.filter(t => {
        const statusMap = {
          'To Do': 'todo',
          'In Progress': 'in-progress',
          'Review': 'review',
          'Done': 'done',
          'Blocked': 'blocked',
        };
        return t.status === statusMap[item.status];
      });
      
      const collaboratorIds = new Set();
      statusTasks.forEach(t => {
        t.assignedTo.forEach(id => collaboratorIds.add(id.toString()));
      });
      
      const collaborators = await User.find({
        _id: { $in: Array.from(collaboratorIds) },
      });
      
      item.collaborators = collaborators.map(u => u.name);
    }

    const topContributors = await Promise.all(
      users.map(async (u) => {
        const userProgress = progress.filter(p => p.userId.toString() === u._id.toString());
        const hours = userProgress.reduce((sum, p) => sum + p.hoursSpent, 0);
        return {
          name: u.name,
          hours: Math.round(hours * 10) / 10,
        };
      })
    );

    topContributors.sort((a, b) => b.hours - a.hours);

    res.json({
      tasksCompleted: tasks.filter(t => t.status === 'done').length,
      activeContributors: users.length,
      hoursThisWeek: Math.round(recentProgress.reduce((sum, p) => sum + p.hoursSpent, 0) * 10) / 10,
      weeklyHoursData,
      taskStatusDistribution,
      topContributors: topContributors.slice(0, 5),
      overdueTasks: tasks.filter(t => {
        if (!t.deadline) return false;
        return new Date(t.deadline) < now && t.status !== 'done';
      }).length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

