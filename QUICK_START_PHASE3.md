# HealthBridge Phase 3 - Quick Start Guide

## What's Been Implemented

Your Phase 3 implementation is now **90% complete**! Here's what's ready to go:

### Core Features ✅
1. **Real Database Integration** - MySQL and PostgreSQL support with connection pooling
2. **Complete Authentication** - Registration, login with JWT tokens and password hashing
3. **Patient Dashboard** - Welcome card, appointment stats, upcoming appointments
4. **Appointments Management** - View, filter by status (upcoming/completed/cancelled)
5. **Saved Clinics** - Browse, search, and manage favorite clinics
6. **User Profile** - Edit personal information, account settings
7. **Responsive UI** - Mobile-first design with purple theme
8. **API Integration** - Full backend-frontend connectivity

### Architecture
- **Backend**: Express.js with TypeScript, dual database support
- **Frontend**: React 19 with TypeScript, React Router, Tailwind CSS
- **Authentication**: JWT tokens with bcrypt password hashing
- **Database**: Comprehensive schema with 14+ tables

---

## Getting Started

### 1. Setup Database

**For MySQL:**
```bash
cd server
npm install

# Create .env file
cp .env.example .env
# Edit .env and set MySQL credentials

# Initialize database
npm run db:setup
```

**For PostgreSQL:**
```bash
# Edit .env file
DB_TYPE=postgres
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=healthbridge

npm run db:setup
```

### 2. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

### 3. Test the Application

1. **Homepage** - Navigate to http://localhost:5173
2. **Register** - Click "Get Started" or "Sign up" link
   - Fill in: First Name, Last Name, Email, Password
3. **Dashboard** - After login, you'll see the patient dashboard
4. **Explore**:
   - Dashboard: View stats and upcoming appointments
   - Appointments: See appointment history by status
   - Saved Clinics: Browse your favorite clinics
   - Profile: Edit your information

---

## File Structure

### Backend (`server/src/`)
```
├── controllers/
│   ├── authController.ts       # Registration & login logic
│   └── patientController.ts    # Dashboard, appointments, clinics
├── routes/
│   ├── authRoutes.ts          # Auth endpoints
│   └── patientRoutes.ts       # Patient endpoints
├── middleware/
│   ├── authMiddleware.ts      # JWT validation
│   └── roleMiddleware.ts      # Role checking
├── database/
│   ├── connection.ts          # DB connection module
│   └── schemas/               # SQL schemas
└── server.ts                  # Main Express server
```

### Frontend (`client/src/`)
```
├── views/
│   ├── patient/
│   │   ├── PatientDashboardView.tsx
│   │   ├── PatientAppointmentsView.tsx
│   │   ├── PatientSavedClinicsView.tsx
│   │   └── PatientProfileView.tsx
│   └── auth/
│       ├── LoginView.tsx
│       └── RegisterView.tsx
├── services/
│   ├── authService.ts        # Auth API calls
│   └── patientService.ts     # Patient API calls
├── context/
│   └── AuthContext.tsx       # Global auth state
└── hooks/
    └── useAuth.ts            # Auth hook
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/register    # Register new user
POST   /api/auth/login       # Login user
```

### Patient Dashboard
```
GET    /api/patient/dashboard            # Dashboard data with stats
GET    /api/patient/appointments         # List all appointments
POST   /api/patient/appointments         # Book new appointment
GET    /api/patient/saved-clinics       # Get saved clinics
POST   /api/patient/save-clinic         # Save clinic
GET    /api/patient/profile             # Get user profile
PUT    /api/patient/profile             # Update profile
```

---

## Next Steps

### To Complete Phase 3
1. **Email/SMS Integration** - Add notification support
2. **Payment Integration** - Stripe checkout for appointments
3. **Clinic Search** - Full search with Leaflet maps (currently stubbed)

### For Phase 4
- Clinic Owner Dashboard
- Admin Dashboard
- Appointment reminders
- Real-time notifications
- Analytics and reporting

---

## Troubleshooting

### Database Connection Issues
- Verify MySQL/PostgreSQL is running
- Check credentials in `.env` file
- Ensure `DB_TYPE` matches your database choice
- Run `npm run db:setup` to recreate tables

### Frontend Not Connecting to Backend
- Check CORS settings in `server/src/server.ts`
- Verify `VITE_API_URL` in `client/.env`
- Ensure both servers are running

### Authentication Issues
- Clear browser localStorage: `localStorage.clear()`
- Verify JWT_SECRET in server `.env`
- Check token expiration: JWT defaults to 7 days

### Database Schema Issues
- Delete existing database and run `npm run db:setup` again
- Check SQL syntax in `schemas/` folder
- Verify column names match controller queries

---

## Key Technologies

- **React 19** - UI components and state management
- **TypeScript** - Type safety for frontend and backend
- **Express.js** - RESTful API server
- **JWT** - Stateless authentication
- **Bcrypt** - Password hashing
- **Tailwind CSS** - Styling framework
- **Axios** - HTTP client
- **React Router** - Client-side routing

---

## Database Support

The application auto-detects and connects to either database based on `DB_TYPE`:

| Feature | MySQL | PostgreSQL |
|---------|-------|------------|
| Connection Type | Pool | Client |
| Geolocation | SPATIAL INDEX | PostGIS |
| UUID Support | No | Native |
| Performance | Excellent | Excellent |

---

## Security Notes

- Passwords are hashed with bcrypt (10 salt rounds)
- JWT tokens expire after 7 days (configurable)
- CORS allows only localhost ports
- Auth middleware protects patient routes
- Consider enabling HTTPS in production

---

## Support

For issues or questions:
1. Check the PHASE_3_IMPLEMENTATION.md for detailed docs
2. Review error messages in browser/server console
3. Verify all environment variables are set
4. Ensure database is initialized with `npm run db:setup`

---

**Status**: Phase 3 core implementation complete and ready for testing!
