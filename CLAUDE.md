# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains a **unified leaderboard platform** that merges features from multiple applications:

- **LeaderboardXcellence**: Employee recognition system (legacy, for reference)
- **SalesLeaderboard**: Sales performance tracking (legacy, for reference) 
- **Leadr**: **Unified platform** combining both systems - **PRIMARY PROJECT**

## Quick Start (Browser-Ready)

The Leadr platform runs entirely in the browser with no Docker or external database dependencies.

### Setup Commands

```bash
# From the Leadr directory
cd Leadr

# Install dependencies
npm install && cd backend && npm install && cd ../frontend && npm install

# Start development (run both in separate terminals)
cd backend && npm run dev    # API server on :5000
cd frontend && npm run dev   # Next.js app on :3000
```

### Leadr Platform Commands

**Development:**
- `cd Leadr/backend && npm run dev` - Start Express API server (port 5000)
- `cd Leadr/frontend && npm run dev` - Start Next.js frontend (port 3000)
- `cd Leadr/backend && npm run db:setup` - Initialize SQLite database
- `cd Leadr/backend && npm run db:seed` - Add sample data

**Testing & Quality:**
- `cd Leadr/backend && npm run lint` - Lint backend code (ESLint)
- `cd Leadr/backend && npm run test` - Run backend tests (Jest)
- `cd Leadr/frontend && npm run lint` - Lint frontend code (Next.js ESLint)

**Production:**
- `cd Leadr && npm run build` - Build both frontend and backend
- `cd Leadr && npm run start` - Start both in production mode

## Architecture Patterns

### LeaderboardXcellence & SalesLeaderboard (Monorepo Pattern)
- **Frontend**: React 18 + TypeScript + Tailwind + shadcn/ui
- **Backend**: Express.js + TypeScript 
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with Passport.js
- **Real-time**: WebSocket for live updates (LeaderboardXcellence only)
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query

### Leadr (Monorepo with Workspace Pattern)
- **Frontend**: Next.js 14 + TypeScript + Tailwind + Radix UI
- **Backend**: Express.js + TypeScript + Socket.IO
- **Database**: SQLite with Drizzle ORM (browser-ready, no external dependencies)
- **Authentication**: JWT-based
- **State Management**: Zustand + TanStack Query
- **Testing**: Jest for backend
- **Linting**: ESLint for both frontend and backend

## Development Notes

### Common Database Operations
- **Legacy projects**: Drizzle ORM with PostgreSQL (`db/schema.ts`)
- **Leadr**: Drizzle ORM with SQLite (`backend/src/models/sqliteSchema.ts`)
  - Database file: `backend/data/leaderboard.db` (auto-created)
  - No external database setup required

### File Upload Handling
- LeaderboardXcellence: Multer with local storage in `uploads/`
- SalesLeaderboard: Multer with local storage in `uploads/`
- Leadr: Not yet implemented

### TypeScript Configuration
All projects use TypeScript with path aliases:
- `@/` maps to frontend source directory
- `@db/` maps to database directory (where applicable)

### Port Conventions
- Development servers typically run on port 5000
- Next.js frontend (Leadr) runs on port 3000
- Backend APIs serve on port 5000

### Environment Variables
- **Legacy projects**: Require `DATABASE_URL` for PostgreSQL connection
- **Leadr**: No database environment variables required (uses local SQLite file)

## Working with Multiple Projects

When working across projects, always specify the project directory in commands. The Leadr project has a different structure with separate frontend/backend packages, while LeaderboardXcellence and SalesLeaderboard use single-package monorepos.