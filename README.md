# HealthBridge - Healthcare Clinic Booking Platform

A modern, full-stack healthcare clinic booking application built with React, TypeScript, and Express.

## 🏗️ Architecture

This is a monorepo with two main workspaces:
- **client**: React + TypeScript frontend with Vite
- **server**: Express + TypeScript backend

## 📋 Prerequisites

- Node.js 18+ and pnpm
- MySQL 8.0+ OR PostgreSQL 14+ (auto-detected during setup)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

**Server setup (.env):**
```bash
cp server/.env.example server/.env
# Edit server/.env with your database credentials
```

**Client setup (.env):**
```bash
cp client/.env.example client/.env
```

### 3. Initialize Database

The setup script auto-detects MySQL or PostgreSQL:

```bash
pnpm db:setup
```

This will:
- Test MySQL and PostgreSQL connections
- Create the database if it doesn't exist
- Initialize all tables and indices

### 4. Start Development Servers

**Both frontend and backend:**
```bash
pnpm dev
```

**Or separately:**
```bash
pnpm client   # Frontend on http://localhost:5173
pnpm server   # Backend on http://localhost:5000
```

## 📁 Project Structure

```
healthbridge/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── views/                  # Page components (organized by role)
│   │   ├── components/             # Reusable UI components
│   │   ├── services/               # API client & services
│   │   ├── context/                # React Context (Auth)
│   │   ├── hooks/                  # Custom hooks
│   │   ├── types/                  # TypeScript types
│   │   ├── styles/                 # Global styles
│   │   ├── App.tsx                 # Main app component
│   │   └── main.tsx                # Vite entry point
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── controllers/            # Request handlers
│   │   ├── routes/                 # API routes
│   │   ├── middleware/             # Auth, role-based access
│   │   ├── models/                 # Database models (types)
│   │   ├── services/               # Business logic
│   │   ├── types/                  # TypeScript types
│   │   ├── database/               # Schemas & migrations
│   │   ├── config/                 # Configuration
│   │   └── server.ts               # Express app
│   ├── .env.example
│   └── tsconfig.json
│
└── README.md
```

## 🎨 Design System

The app uses a **purple gradient color palette** with:
- **Primary**: #7C5CFF (purple)
- **Neutrals**: White, grays, dark navy
- **Accents**: Blue (#0EA5E9), Pink (#EC4899)

Built with **Tailwind CSS** for responsive, modern design.

## 🔐 Authentication

- JWT-based authentication
- Password hashing with bcryptjs
- Token stored in localStorage
- Role-based access control (RBAC)

### User Roles
- **patient**: Browse clinics, book appointments, manage health records
- **clinic_owner**: Manage clinic, staff, appointments
- **clinic_admin**: Clinic staff member
- **hb_admin**: HealthBridge admin
- **sys_admin**: System administrator

## 🗄️ Database Support

The app supports both **MySQL** and **PostgreSQL**:

### Environment Variables

**MySQL:**
```
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DB=healthbridge
```

**PostgreSQL:**
```
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=healthbridge
```

The setup script will auto-detect which database is available and initialize it.

## 🔌 API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Patient Routes
- `GET /api/patient/dashboard` - Patient dashboard
- `GET /api/patient/appointments` - Get appointments
- `GET /api/patient/saved-clinics` - Get saved clinics

### (Clinic & Admin routes coming soon)

## 🎯 Features - Phase 1

✅ User authentication (login/register)
✅ Landing page with service cards
✅ Patient dashboard
✅ Appointment management
✅ Saved clinics
✅ Role-based routing & access control
✅ Responsive design

## 📦 Build & Deployment

### Build for Production

```bash
pnpm build
```

### Server Only
```bash
cd server && pnpm build && pnpm start
```

### Client Only
```bash
cd client && pnpm build && pnpm preview
```

## 🛠️ Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS
- Leaflet/MapLibre (maps - coming soon)

### Backend
- Express.js
- TypeScript
- JWT Authentication
- bcryptjs
- MySQL2 / PostgreSQL

## 📝 Notes

- The app uses in-memory user storage for now (replace with database models)
- API responses use standardized format
- CORS enabled for localhost:5173
- Error handling & validation middleware ready

## 🚦 Next Steps

1. Add database integration (MySQL/PostgreSQL models)
2. Implement clinic search with Leaflet/MapLibre
3. Add appointment booking flow
4. Build clinic & admin dashboards
5. Add real-time notifications
6. Email verification & password reset

## 📄 License

MIT
