import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL?.split(',') || false
    : true,
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is required');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  retryWrites: true,
  w: 'majority',
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('MongoDB connection error:', err.message);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});
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

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

export default app;

