import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from '../server/routes/auth.js';
import usersRoutes from '../server/routes/users.js';
import tasksRoutes from '../server/routes/tasks.js';
import progressRoutes from '../server/routes/progress.js';
import notificationsRoutes from '../server/routes/notifications.js';
import analyticsRoutes from '../server/routes/analytics.js';
import activityRoutes from '../server/routes/activity.js';
import commentsRoutes from '../server/routes/comments.js';
import templatesRoutes from '../server/routes/templates.js';
import projectsRoutes from '../server/routes/projects.js';
import dependenciesRoutes from '../server/routes/dependencies.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL?.split(',') || true
    : true,
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

let mongooseConnected = false;

const connectDB = async () => {
  if (mongooseConnected) {
    return;
  }
  
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('MONGODB_URI environment variable is required');
    throw new Error('MONGODB_URI not configured');
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      retryWrites: true,
      w: 'majority',
    });
    mongooseConnected = true;
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('DB connection error in middleware:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/dependencies', dependenciesRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message || 'An error occurred',
  });
});

export default async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

