import express from 'express';
const router = express.Router();
import { auth } from '../middleware/auth.js';
import TaskTemplate from '../models/TaskTemplate.js';

router.get('/', auth, async (req, res) => {
  try {
    const templates = await TaskTemplate.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(templates.map(t => ({
      id: t._id.toString(),
      name: t.name,
      title: t.title,
      description: t.description,
      tags: t.tags,
      priority: t.priority,
      estimatedHours: t.estimatedHours,
      createdBy: t.createdBy._id.toString(),
      createdAt: t.createdAt.toISOString(),
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const template = new TaskTemplate({
      ...req.body,
      createdBy: req.user._id,
    });

    await template.save();

    res.status(201).json({
      id: template._id.toString(),
      name: template.name,
      title: template.title,
      description: template.description,
      tags: template.tags,
      priority: template.priority,
      estimatedHours: template.estimatedHours,
      createdBy: template.createdBy.toString(),
      createdAt: template.createdAt.toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await TaskTemplate.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

