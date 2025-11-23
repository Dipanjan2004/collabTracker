# CollabTrack - Task & Progress Tracker

A modern, futuristic frontend-only demo of CollabTrack - a task and contributor progress tracking system for creative teams.

## 🚀 Features

- **Beautiful Dark UI** - Futuristic design with glassmorphism, gradients, and smooth GSAP animations
- **Mock API Layer** - Complete localStorage-based mock backend for instant demo
- **Role-Based Access** - Admin and Collaborator views with different permissions
- **Task Management** - Create, assign, track tasks with progress timelines
- **Analytics Dashboard** - Beautiful charts showing team performance and task distribution
- **Real-time Progress** - Track daily progress logs with percentage completion and hours spent
- **Responsive Design** - Mobile-first, works beautifully on all devices

## 🎮 Demo Login Credentials

**Admin Account:**
- Email: `demo.admin@collabtrack.app`
- Password: `DemoPass123`

**Collaborator Account:**
- Email: `aisha@demo.app`
- Password: `DemoPass123`

## 🛠️ Tech Stack

- React 18 + Vite + TypeScript
- Tailwind CSS for styling
- GSAP for animations
- Recharts for data visualization
- Shadcn/ui components
- React Router for navigation
- localStorage for mock data persistence

## 📦 Installation

```bash
npm install
```

## 🏃 Running the App

```bash
npm run dev
```

Visit `http://localhost:8080`

## 🎬 1-Minute Demo Script (for interviews)

1. **0-10s**: "This is CollabTrack — a task and progress tracker for creative teams built with React, TypeScript, and Tailwind CSS."

2. **10-25s**: Show Admin dashboard with animated stat cards, charts showing weekly hours, task distribution, and top contributors.

3. **25-40s**: Navigate to Tasks, show task cards with progress bars. Click a task to show detailed view (upcoming feature).

4. **40-55s**: Demonstrate role-based access by logging in as a collaborator. Show different view with only assigned tasks.

5. **55-60s**: "This is a complete frontend with mock APIs. Backend integration is ready with documented API contracts. I can extend with real-time features, file uploads, and advanced analytics."

## 🏗️ Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── layout/        # AppShell, Topbar, Sidebar
│   ├── ui/            # Shadcn components
│   └── ...            # StatCard, TaskCard, etc.
├── contexts/          # AuthContext for user management
├── pages/             # Route pages (Landing, Login, Dashboard, etc.)
├── services/          # Mock API layer with localStorage
├── types/             # TypeScript type definitions
└── utils/             # Animation helpers, PDF export

```

## 🔄 Backend Integration (Future)

This frontend is ready for backend integration. To connect to a real API:

1. Replace mock API calls in `src/services/mockApi.ts`
2. Set `VITE_API_BASE_URL` environment variable
3. Implement JWT token refresh logic
4. Follow the API contracts in `/api-contracts/` (to be created)

## 📝 Features Implemented

✅ Landing page with hero section
✅ Authentication (Login/Register with mock JWT)
✅ Admin dashboard with analytics charts
✅ Collaborator dashboard with assigned tasks
✅ Task list with search and filters
✅ Role-based navigation and permissions
✅ Notifications drawer (UI ready)
✅ Responsive design with collapsible sidebar
✅ GSAP animations throughout
✅ Glass morphism design system
✅ Dark theme with neon accents

## 🎨 Design System

- **Primary**: Mint-blue gradient (#6EE7B7 → #60A5FA)
- **Accent**: Coral-yellow gradient (#FB7185 → #FBBF24)
- **Background**: Near-black with subtle radial gradients
- **Cards**: Glassmorphism with backdrop blur
- **Typography**: Inter variable font
- **Animations**: GSAP with ScrollTrigger

## 📄 License

Demo project for interview purposes.
