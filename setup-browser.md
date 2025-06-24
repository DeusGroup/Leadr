# Browser-Ready Unified Leaderboard Platform

This setup removes all Docker dependencies and runs directly in the browser using SQLite for maximum simplicity.

## Quick Start

### 1. Install Dependencies

```bash
# Install root dependencies
cd Leadr
npm install

# Install backend dependencies
cd backend
npm install better-sqlite3 drizzle-orm

# Install frontend dependencies  
cd ../frontend
npm install
```

### 2. Environment Setup

Create a `.env` file in the backend directory:

```bash
# backend/.env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-here
```

### 3. Run the Application

```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory, in another terminal)
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Key Changes for Browser Deployment

1. **Database**: Switched from PostgreSQL to SQLite (file-based)
   - No external database server needed
   - Database file created automatically in `backend/data/`

2. **No Docker**: Removed all Docker files and configurations
   - Runs directly with Node.js
   - No containerization needed

3. **Simplified Dependencies**: 
   - Uses `better-sqlite3` instead of `postgres`
   - Local file storage for uploads
   - All dependencies can be installed via npm

## Database

- **Location**: `backend/data/leaderboard.db`
- **Type**: SQLite3 with WAL mode enabled
- **Auto-initialized**: Schema and sample data created on first run
- **Migrations**: Handled automatically via SQL scripts

## File Structure

```
Leadr/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── config/
│   │   │   └── sqliteDatabase.ts    # SQLite configuration
│   │   ├── controllers/             # Enhanced API controllers
│   │   ├── routes/                  # API route definitions
│   │   └── scripts/                 # Migration scripts
│   └── data/                        # SQLite database files
├── frontend/                        # Next.js frontend
│   └── src/
└── shared/                          # Shared TypeScript types
```

## Features Included

✅ **User Management**: Full CRUD with role-based permissions
✅ **Metrics Tracking**: Points, revenue, deals, voice seats
✅ **Achievement System**: Automatic achievement detection
✅ **Analytics**: Rich reporting and charts
✅ **File Uploads**: Avatar management
✅ **Real-time Updates**: WebSocket support
✅ **Migration Tools**: Import from existing applications

## Data Migration

To migrate data from existing LeaderboardXcellence or SalesLeaderboard applications:

```bash
# Set source database URLs in .env
LEADERBOARD_EXCELLENCE_DATABASE_URL=postgresql://...
SALES_LEADERBOARD_DATABASE_URL=postgresql://...

# Run migration
npm run migrate:all
```

## Deployment

For production deployment to platforms like Vercel, Netlify, or Heroku:

1. **Frontend**: Deploy to Vercel/Netlify (zero config)
2. **Backend**: Deploy to Heroku/Railway/Render
3. **Database**: SQLite file persists with the backend deployment

No external database service required!