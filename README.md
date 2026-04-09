# CollabTrack - Task & Progress Management for Creative Teams

> **Ship work. Track progress. Keep everyone aligned.**

CollabTrack is a fullstack task and progress tracking platform built for creative teams.
It gives admins a bird's-eye view of project health while empowering collaborators with
personalized dashboards, progress logging, and real-time feedback loops — all wrapped in
a dark, glassy, animated interface.

---

## Motto & Purpose

**Motto:** *Ship work. Track progress. Keep everyone aligned.*

CollabTrack solves a specific problem: **creative teams need more than a to-do list.** They need:

- **Visibility** — Admins see who's working on what, what's overdue, and how hours are distributed.
- **Accountability** — Collaborators log progress with percentage completion, hours spent, and file attachments. Admins approve or reject with inline feedback.
- **Velocity** — Kanban boards, calendar views, task templates, drag-and-drop status changes, and real-time notifications keep things moving.

The progress-approval workflow (`pending → approved/rejected`) is the core loop: collaborators submit, admins review, feedback flows back, and activity logs capture it all.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui (Radix primitives), CSS custom properties |
| **Animations** | GSAP + ScrollTrigger |
| **Charts** | Recharts |
| **Routing** | React Router v6 |
| **State** | React Context (Auth), TanStack Query, component state |
| **Forms** | react-hook-form + zod resolvers |
| **PDF** | jsPDF + html2canvas |
| **Backend** | Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | JWT (7-day expiry, bcrypt password hashing) |
| **Deployment** | Vercel (serverless API + static SPA) |

---

## Project Structure

```
collabTracker/
├── api/
│   └── index.js                  # Vercel serverless entry point
├── server/
│   ├── index.js                  # Express server (local dev)
│   ├── middleware/
│   │   └── auth.js               # JWT auth middleware + JWT_SECRET
│   ├── models/
│   │   ├── User.js               # User schema (bcrypt, toJSON strips password)
│   │   ├── Task.js               # Task schema (5 statuses, priorities, projects)
│   │   ├── ProgressLog.js        # Progress entries (percentage, hours, feedback)
│   │   ├── Comment.js            # Threaded comments (parentId self-reference)
│   │   ├── Notification.js       # In-app notifications (5 types)
│   │   ├── Activity.js           # Audit log (denormalized userName)
│   │   ├── TaskTemplate.js       # Reusable task blueprints
│   │   ├── Project.js            # Project groupings (color, taskIds)
│   │   └── TaskDependency.js     # Task relationships (blocks/required_by)
│   ├── routes/
│   │   ├── auth.js               # POST /register, POST /login
│   │   ├── users.js              # GET /, POST /invite, DELETE /:id
│   │   ├── tasks.js              # Full CRUD + search/filter/archive/clone
│   │   ├── progress.js           # CRUD + approve/reject workflow
│   │   ├── comments.js           # CRUD with ownership enforcement
│   │   ├── notifications.js      # GET /, PUT /:id/read
│   │   ├── analytics.js          # GET /overview (aggregated dashboard data)
│   │   ├── activity.js           # GET /, GET /task/:id, GET /user/:id
│   │   ├── templates.js          # CRUD for task templates
│   │   ├── projects.js           # CRUD + add/remove tasks
│   │   └── dependencies.js      # CRUD for task dependencies
│   └── scripts/
│       ├── seed.cjs              # CommonJS seed script
│       └── seed.js               # ESM seed script
├── src/
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Router + providers (Auth, Query, Tooltip)
│   ├── contexts/
│   │   └── AuthContext.tsx        # Auth state (login, register, logout, user)
│   ├── types/
│   │   └── index.ts              # All TypeScript interfaces & type unions
│   ├── services/
│   │   ├── api.ts                # REST API client (all endpoints, token auth)
│   │   ├── mockApi.ts            # localStorage mock API (identical interface)
│   │   └── mockData.ts           # Seed data (3 users, 4 tasks, 4 logs, etc.)
│   ├── hooks/
│   │   ├── use-mobile.tsx        # Viewport breakpoint hook (<768px)
│   │   └── use-toast.ts          # shadcn/ui toast state system
│   ├── utils/
│   │   ├── animations.ts         # GSAP utilities (page transitions, counters, glow)
│   │   └── pdfExport.ts          # jsPDF + html2canvas report generation
│   ├── lib/
│   │   └── utils.ts               # cn() utility (clsx + twMerge)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx       # Topbar + Sidebar + content wrapper
│   │   │   ├── Sidebar.tsx       # Nav links, collapsible, mobile Sheet
│   │   │   └── Topbar.tsx         # Brand, search, notifications, user menu
│   │   ├── ui/                   # 58 shadcn/ui primitives (Radix-based)
│   │   ├── ErrorBoundary.tsx     # React error boundary with fallback UI
│   │   ├── NavLink.tsx           # Active/pending class router link
│   │   ├── NotificationsDrawer.tsx # Slide-in notification panel (3s polling)
│   │   ├── ProtectedRoute.tsx    # Auth guard + role-based filter
│   │   ├── StatCard.tsx          # Animated counter dashboard card
│   │   └── TaskCard.tsx           # Rich task card (priority, progress, status)
│   └── pages/
│       ├── Landing.tsx            # Public marketing page (GSAP animated)
│       ├── Login.tsx              # Sign-in with admin/user toggle
│       ├── Register.tsx           # Account creation (password validation)
│       ├── Dashboard.tsx          # Analytics overview + charts + dialogs
│       ├── Tasks.tsx              # Multi-view task list (grid/list/kanban/calendar)
│       ├── TaskDetail.tsx         # Full task view (834 lines — progress, comments, timer)
│       ├── CreateTask.tsx         # Task creation form
│       ├── EditTask.tsx           # Task edit form (multi-select assignees)
│       ├── TaskTemplates.tsx      # Admin template CRUD + "Use Template"
│       ├── CalendarView.tsx       # Monthly calendar with task popovers
│       ├── KanbanView.tsx         # Drag-and-drop status board
│       ├── Activity.tsx           # Activity feed with colored badges
│       ├── Users.tsx              # Admin team management (invite, remove)
│       ├── Settings.tsx           # Preferences UI (not persisted yet)
│       ├── Reports.tsx            # PDF report generation
│       ├── Index.tsx              # Blank placeholder page
│       └── NotFound.tsx           # 404 page
├── create-admin.cjs               # Script: create admin user
├── create-collaborator.cjs        # Script: create collaborator user
├── make-admin.cjs                 # Script: promote user to admin by email
├── vercel.json                    # Vercel deployment (rewrites + headers)
├── vite.config.ts                 # Vite config (proxy /api → :5001, alias @/)
├── tailwind.config.ts             # Tailwind + shadcn/ui design system
├── tsconfig.json                  # TypeScript project references
├── eslint.config.js               # ESLint flat config
└── components.json                # shadcn/ui CLI config
```

---

## Data Models

### User
| Field | Type | Notes |
|-------|------|-------|
| name | String, required | Trimmed |
| email | String, required, unique | Lowercased |
| password | String, required, min 6 | bcrypt hashed, stripped from JSON |
| role | Enum: `admin`, `collaborator` | Defaults to `collaborator` |
| avatarUrl | String | Auto-generated via DiceBear |
| active | Boolean | Defaults `true`; soft-deleted = `false` |

### Task
| Field | Type | Notes |
|-------|------|-------|
| title | String, required | Trimmed |
| description | String | — |
| assignedTo | ObjectId[] (ref User) | Multiple assignees |
| tags | String[] | — |
| status | Enum: `todo`, `in-progress`, `blocked`, `review`, `done` | Defaults `todo` |
| priority | Enum: `low`, `medium`, `high` | Defaults `medium` |
| estimatedHours | Number | Defaults 0 |
| deadline | Date | — |
| createdBy | ObjectId (ref User) | Set from auth |
| archived | Boolean | Defaults `false` |
| projectId | ObjectId (ref Project) | Optional grouping |

### ProgressLog
| Field | Type | Notes |
|-------|------|-------|
| taskId | ObjectId (ref Task) | — |
| userId | ObjectId (ref User) | — |
| date | Date, required | — |
| progressText | String, required | — |
| percentageComplete | Number, 0–100 | — |
| hoursSpent | Number, min 0 | — |
| attachments | String[] | URLs |
| links | String[] | — |
| feedbackStatus | Enum: `pending`, `approved`, `rejected` | Defaults `pending` |
| adminFeedback | String | — |

### Comment (Threaded)
| Field | Type | Notes |
|-------|------|-------|
| taskId | ObjectId (ref Task) | — |
| userId | ObjectId (ref User) | — |
| userName | String, required | Denormalized for fast reads |
| content | String, required | — |
| parentId | ObjectId (ref Comment) | Self-referencing for nested replies |

### Notification
| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId (ref User) | Target user |
| type | Enum: `task_assigned`, `deadline_approaching`, `progress_submitted`, `progress_approved`, `progress_rejected` | — |
| message | String, required | — |
| read | Boolean | Defaults `false` |
| payload | Mixed | Arbitrary data (taskId, progressId, etc.) |

### ActivityItem
| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId (ref User) | — |
| userName | String, required | Denormalized |
| action | String, required | e.g. "created task", "approved progress" |
| targetType | Enum: `task`, `progress`, `user` | — |
| targetId | String, required | Flexible (not ObjectId) |

### TaskTemplate
| Field | Type | Notes |
|-------|------|-------|
| name | String, required | — |
| title | String, required | — |
| description | String | — |
| tags | String[] | — |
| priority | Enum: `low`, `medium`, `high` | Defaults `medium` |
| estimatedHours | Number | Defaults 0 |
| createdBy | ObjectId (ref User) | — |

### Project
| Field | Type | Notes |
|-------|------|-------|
| name | String, required | — |
| description | String | — |
| color | String | Defaults `#6EE7B7` |
| createdBy | ObjectId (ref User) | — |
| taskIds | ObjectId[] (ref Task) | Managed via add/remove endpoints |

### TaskDependency
| Field | Type | Notes |
|-------|------|-------|
| taskId | ObjectId (ref Task) | — |
| dependsOnTaskId | ObjectId (ref Task) | — |
| type | Enum: `blocks`, `required_by` | — |

---

## API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Create account, returns JWT |
| POST | `/login` | No | Authenticate, returns JWT |

### Users (`/api/users`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Yes | List all active users |
| POST | `/invite` | Admin | Send invite (stub) |
| DELETE | `/:id` | Admin | Soft-delete user (active:false) |

### Tasks (`/api/tasks`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Yes | List tasks (filter: assignedTo, status, tags, search, archived, projectId) |
| GET | `/:id` | Yes | Get single task |
| POST | `/` | Yes | Create task + send notifications + log activity |
| PUT | `/:id` | Yes | Update task |
| DELETE | `/:id` | Yes | Delete task + cascade (comments, progress, dependencies) |
| POST | `/:id/archive` | Yes | Archive task |
| POST | `/:id/unarchive` | Yes | Unarchive task |
| POST | `/:id/clone` | Yes | Clone task (resets status, assignees) |

### Progress (`/api/progress`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/task/:taskId` | Yes | Get progress logs for task |
| POST | `/` | Yes | Submit progress + notify task creator |
| POST | `/:id/approve` | Admin | Approve progress + notify submitter |
| POST | `/:id/reject` | Admin | Reject progress + notify submitter |

### Comments (`/api/comments`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/task/:taskId` | Yes | Get comments for task |
| POST | `/` | Yes | Create comment (supports parentId for threads) + log activity |
| PUT | `/:id` | Owner | Update comment (owner only) |
| DELETE | `/:id` | Owner | Delete comment (owner only) |

### Notifications (`/api/notifications`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Yes | Get user's notifications (sorted newest) |
| PUT | `/:id/read` | Yes | Mark notification as read |

### Analytics (`/api/analytics`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/overview` | Yes | Aggregated dashboard data |

### Activity (`/api/activity`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Yes | All activity |
| GET | `/task/:taskId` | Yes | Activity for a task |
| GET | `/user/:userId` | Yes | Activity for a user |

### Templates (`/api/templates`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Yes | List templates |
| POST | `/` | Yes | Create template |
| DELETE | `/:id` | Yes | Delete template |

### Projects (`/api/projects`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Yes | List projects |
| POST | `/` | Yes | Create project |
| PUT | `/:id` | Yes | Update project |
| DELETE | `/:id` | Yes | Delete project |
| POST | `/:id/tasks` | Yes | Add task to project |
| DELETE | `/:id/tasks/:taskId` | Yes | Remove task from project |

### Dependencies (`/api/dependencies`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/task/:taskId` | Yes | Get dependencies for task |
| POST | `/` | Yes | Create dependency |
| DELETE | `/:id` | Yes | Delete dependency |

---

## Key Features

### Role-Based Access
- **Admins** see all tasks, manage users, approve/reject progress, create/edit/delete/clone/archive tasks, manage templates
- **Collaborators** see only their assigned tasks, submit progress, comment, track time

### Progress Approval Workflow
1. Collaborator submits a progress log (text, percentage, hours, attachments)
2. Status is `pending`
3. Admin reviews and either **approves** or **rejects** with feedback
4. Notification sent to the collaborator with the outcome

### Multi-View Task Management
- **Grid view** — Card layout with filters and bulk actions
- **List view** — Compact single-column layout
- **Kanban view** — Drag-and-drop status columns
- **Calendar view** — Monthly calendar with task popovers

### Real-Time Notifications
- Notification bell in topbar polls every 5 seconds
- Notifications drawer with 3-second polling when open
- Types: task assigned, deadline approaching, progress submitted/approved/rejected

### Analytics Dashboard
- Stat cards with animated counters: tasks completed, active contributors, hours this week, overdue tasks
- Weekly hours line chart, top contributors bar chart
- Detail dialogs for each stat (admin only)

### Task Templates
- Admins create reusable templates with title, description, tags, priority, hours
- "Use Template" creates a task from a template with a 7-day default deadline

### PDF Reports
- Export task progress reports as PDF using jsPDF + html2canvas
- Date range selection for filtered reports

### Design System
- Dark futuristic UI: deep navy background (`hsl(222 84% 3%)`), mint-green primary (`hsl(158 64% 52%)`), coral accents
- Glassmorphism cards (`glass-card` class)
- GSAP page transitions, scroll-triggered animations, animated counters/progress bars
- Fully responsive (mobile-first with collapsible sidebar)

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Clone and install
git clone <repo-url>
cd collabTracker
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with:
#   MONGODB_URI=mongodb://localhost:27017/collabtrack
#   JWT_SECRET=your-secret-key

# Seed an admin user
npm run create-admin

# (Optional) Create a collaborator
npm run create-collaborator

# (Optional) Promote an existing user to admin
npm run make-admin user@example.com
```

### Development

```bash
# Terminal 1: Start the backend
npm run server

# Terminal 2: Start the frontend
npm run dev
```

The app runs at `http://localhost:8080` (Vite proxies `/api` to Express on port 5001).

### Production Build

```bash
npm run build
npm start
```

---

## Deployment on Vercel

The `vercel.json` configures:
- **Build:** `npm run build` → output to `dist/`
- **API routes:** `/api/*` → `api/index.js` (serverless function)
- **SPA fallback:** All other routes → `index.html`
- **Static assets:** 1-year cache headers

Set these environment variables in the Vercel dashboard:
- `MONGODB_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — Secure random string
- `NODE_ENV` — `production`

---

## Default Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `demo.admin@collabtrack.app` | `DemoPass123` |
| Admin (seed script) | `admin@collabtrack.app` | `Admin123!` |
| Collaborator (seed script) | `collaborator@collabtrack.app` | `Collaborator123!` |

---

## License

Project for portfolio and interview purposes.