# Unified Leaderboard Platform - Backend

This is the Express.js backend API for the Unified Leaderboard Platform.

## Features

- RESTful API with Express.js and TypeScript
- PostgreSQL database with Drizzle ORM
- JWT authentication and authorization
- Real-time updates via WebSocket
- Comprehensive logging with Winston
- Role-based access control

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

3. Set up the database:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at [http://localhost:3001](http://localhost:3001)

## Project Structure

```
src/
├── routes/             # API route definitions
├── controllers/        # Business logic
├── models/            # Database schema and models
├── middleware/        # Express middleware
├── utils/             # Utility functions
├── config/            # Configuration files
└── scripts/           # Database scripts
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `REDIS_URL` - Redis connection string (optional)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run lint` - Run ESLint

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (admin only)
- `PUT /api/users/:id` - Update user (admin/manager)

### Leaderboards
- `GET /api/leaderboards` - Get all leaderboards
- `GET /api/leaderboards/:id` - Get leaderboard by ID
- `GET /api/leaderboards/:id/rankings` - Get leaderboard rankings
- `POST /api/leaderboards` - Create leaderboard (admin/manager)

### Metrics
- `GET /api/metrics` - Get metrics
- `POST /api/metrics` - Add metric
- `GET /api/metrics/user/:userId` - Get user metrics

### Sales
- `GET /api/sales/performance` - Get sales performance
- `GET /api/sales/goals` - Get sales goals
- `POST /api/sales/goals` - Create sales goal

### Achievements
- `GET /api/achievements` - Get achievements
- `GET /api/achievements/user/:userId` - Get user achievements
- `POST /api/achievements/:id/award/:userId` - Award achievement
