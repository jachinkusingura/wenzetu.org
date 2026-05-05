# 🚀 Quick Start Guide - HealthBridge

## 30-Minute Setup

### Step 1: Prerequisites Check (2 min)
You need:
- Node.js 18+ with pnpm
- MySQL 8.0+ OR PostgreSQL 14+ installed and running

### Step 2: Install Dependencies (3 min)
```bash
cd /vercel/share/v0-project
pnpm install
```

### Step 3: Setup Environment Variables (2 min)

**For MySQL:**
```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DB=healthbridge

JWT_SECRET=your-super-secret-jwt-key
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

**For PostgreSQL:**
```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=healthbridge

JWT_SECRET=your-super-secret-jwt-key
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

**For Client:**
```bash
cp client/.env.example client/.env
```

### Step 4: Initialize Database (5 min)
```bash
pnpm db:setup
```

This will:
- ✅ Auto-detect MySQL or PostgreSQL
- ✅ Create the database
- ✅ Initialize all tables
- ✅ Create indices

You'll see output like:
```
✓ MySQL connection successful
✓ Database "healthbridge" ready
✓ Tables created successfully
✓ MySQL setup complete

✅ Database setup complete!
```

### Step 5: Start Development Servers (2 min)
```bash
pnpm dev
```

This starts both servers:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

You'll see:
```
> pnpm --filter client dev
> pnpm --filter server dev

🏥 HealthBridge Server running on port 5000
```

## 🎯 Test the Application

### Option 1: Frontend Only
Open http://localhost:5173 in your browser

**You can see:**
- ✅ Home page with purple theme
- ✅ Service cards
- ✅ Team section
- ✅ Sign in / Sign up buttons

### Option 2: Try Authentication
1. Click "Get Started" or "Sign up"
2. Enter:
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john@example.com`
   - Password: `password123`
3. Click "Create account"
4. You'll be redirected to Patient Dashboard
5. See appointments and saved clinics

### Option 3: Try Login
1. Click "Sign in"
2. Enter:
   - Email: `john@example.com`
   - Password: `password123`
3. Click "Sign in"
4. You'll see the Patient Dashboard

## 📁 Project Structure

```
healthbridge/
├── client/              Frontend (React + Vite)
│   └── src/
│       ├── views/       Page components
│       ├── services/    API calls
│       ├── context/     Auth state
│       └── styles/      CSS
├── server/              Backend (Express)
│   └── src/
│       ├── controllers/ Request handlers
│       ├── routes/      API endpoints
│       ├── middleware/  Auth & validation
│       └── database/    Schema & setup
└── README.md
```

## 🛑 Troubleshooting

### Port Already in Use
If port 5000 or 5173 is in use:

```bash
# Change backend port in server/.env
PORT=5001

# Change frontend port in client/vite.config.ts (modify proxy URL too)
server: {
  port: 5174
}
```

### Database Connection Failed
1. **For MySQL**: Ensure MySQL is running
   ```bash
   # macOS
   mysql.server start
   
   # Linux
   sudo systemctl start mysql
   ```

2. **For PostgreSQL**: Ensure PostgreSQL is running
   ```bash
   # macOS
   brew services start postgresql
   
   # Linux
   sudo systemctl start postgresql
   ```

3. Check credentials in `server/.env`

### "Cannot find module" errors
```bash
# Clear and reinstall
pnpm install --force
pnpm db:setup
pnpm dev
```

### Modules not installing
Ensure you're using pnpm:
```bash
npm install -g pnpm@latest
pnpm install
```

## 🎨 Design Features

The app uses a **purple gradient theme**:
- Primary button color: `#7c5cff`
- Landing page with hero image placeholders
- Professional medical imagery style
- Responsive on all devices
- Smooth animations and transitions

## 🔐 Test Accounts

After signup, use any email/password combo:
```
Email: test@example.com
Password: password123
```

Accounts are stored in memory (replace with DB in next phase).

## 📝 What's Working Now

✅ User Registration & Login
✅ JWT Authentication
✅ Patient Dashboard
✅ Appointment Management (UI)
✅ Saved Clinics (UI)
✅ Role-Based Routing
✅ Responsive Design
✅ Purple Theme
✅ Landing Page

## ⏳ What's Coming Soon

- Clinic search with Leaflet map
- Clinic dashboard
- Admin dashboard
- Database integration for appointments
- Real data persistence
- Email notifications

## 📞 Need Help?

Check these files:
1. **README.md** - Full documentation
2. **PROJECT_SUMMARY.md** - Detailed overview
3. **FILES_CREATED.md** - Complete file listing

## 💡 Pro Tips

1. **Hot reload**: Save files and see changes instantly
2. **Error messages**: Check terminal for detailed errors
3. **Network tab**: Browser DevTools shows API calls
4. **Console logs**: Server logs appear in terminal
5. **TypeScript**: IDE shows type errors before running

## 🚀 Next Steps

After successful setup:

1. **Explore the code**:
   - Check `client/src/views/shared/HomeView.tsx` for landing page
   - Check `client/src/views/auth/LoginView.tsx` for authentication
   - Check `server/src/controllers/authController.ts` for backend logic

2. **Add new features**:
   - Create new views in `client/src/views/`
   - Add API routes in `server/src/routes/`
   - Create controllers in `server/src/controllers/`

3. **Connect real database**:
   - Replace `authController.ts` with database queries
   - Update routes with real data
   - Test with actual clinic data

## 🎯 Your Next Build Targets

**Phase 2** (2-3 hours):
- Clinic search with map
- Clinic detail page
- Appointment booking flow

**Phase 3** (3-4 hours):
- Clinic dashboard
- Staff management
- Medicine inventory

**Phase 4** (3-4 hours):
- Admin dashboard
- Clinic verification
- User management

---

**Ready to build?** 🏗️

Start with: `pnpm dev`

Then open: http://localhost:5173

Enjoy! 🎉
