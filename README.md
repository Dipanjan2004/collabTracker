# CollabTrack - Task & Progress Tracker

A fullstack MERN application for task and contributor progress tracking for creative teams.

## Features

- Modern UI with glassmorphism, gradients, and smooth animations
- Fullstack Architecture - Express.js backend with MongoDB database
- Role-Based Access - Admin and Collaborator views with different permissions
- Task Management - Create, assign, track tasks with progress timelines
- Analytics Dashboard - Charts showing team performance and task distribution
- Progress Tracking - Track daily progress logs with percentage completion and hours spent
- Responsive Design - Mobile-first, works on all devices
- Real-time Updates - Live notifications and activity feeds

## Tech Stack

**Frontend:**
- React 18 + Vite + TypeScript
- Tailwind CSS for styling
- GSAP for animations
- Recharts for data visualization
- Shadcn/ui components
- React Router for navigation

**Backend:**
- Node.js + Express.js
- MongoDB with Mongoose
- JWT authentication
- RESTful API

## Installation

```bash
npm install
```

## Running the App

### Development

1. Set up environment variables:
```bash
cp .env.example .env
```

2. Update `.env` with your MongoDB connection string:
```
MONGODB_URI=mongodb://localhost:27017/collabtrack
JWT_SECRET=your-secret-key
```

3. Start the backend server:
```bash
npm run server
```

4. In a new terminal, start the frontend:
```bash
npm run dev
```

<<<<<<< HEAD
Visit `http://localhost:8080`

### Production Build

```bash
npm run build
npm start
```

## Deployment on Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - A secure random string
   - `NODE_ENV` - Set to `production`
4. Deploy!

The `vercel.json` configuration handles both frontend and backend routing automatically.

## Project Structure

```
├── server/              # Backend Express server
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   └── middleware/     # Auth middleware
├── src/                # Frontend React app
│   ├── components/     # Reusable UI components
│   ├── pages/          # Route pages
│   ├── services/       # API service layer
│   ├── contexts/       # React contexts
│   └── types/          # TypeScript types
└── vercel.json         # Vercel deployment config
```

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/progress/task/:taskId` - Get progress logs
- `POST /api/progress` - Create progress log
- `GET /api/analytics/overview` - Get analytics data
- And more...

## License

Project for portfolio and interview purposes.
