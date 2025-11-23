import express from 'express';
const router = express.Router();
import { auth } from '../middleware/auth.js';
import Project from '../models/Project.js';

router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(projects.map(p => ({
      id: p._id.toString(),
      name: p.name,
      description: p.description,
      color: p.color,
      createdBy: p.createdBy._id.toString(),
      createdAt: p.createdAt.toISOString(),
      taskIds: p.taskIds.map(t => t.toString()),
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      createdBy: req.user._id,
      taskIds: [],
    });

    await project.save();

    res.status(201).json({
      id: project._id.toString(),
      name: project.name,
      description: project.description,
      color: project.color,
      createdBy: project.createdBy.toString(),
      createdAt: project.createdAt.toISOString(),
      taskIds: [],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      id: project._id.toString(),
      name: project.name,
      description: project.description,
      color: project.color,
      createdBy: project.createdBy.toString(),
      createdAt: project.createdAt.toISOString(),
      taskIds: project.taskIds.map(t => t.toString()),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/tasks', auth, async (req, res) => {
  try {
    const { taskId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (!project.taskIds.includes(taskId)) {
      project.taskIds.push(taskId);
      await project.save();
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id/tasks/:taskId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    project.taskIds = project.taskIds.filter(
      id => id.toString() !== req.params.taskId
    );
    await project.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

