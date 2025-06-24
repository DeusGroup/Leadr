# Unified Leaderboard Platform

A modern, scalable leaderboard platform that combines employee recognition and sales performance tracking features.

## Features

- **Employee Recognition**: Points-based achievement system with real-time updates
- **Sales Performance**: Revenue tracking with weighted scoring algorithms
- **Multi-tenant Support**: Organization-based data isolation
- **Real-time Updates**: Live leaderboard updates using WebSocket connections
- **Responsive Design**: Mobile-first UI with dark/light theme support
- **Analytics Dashboard**: Performance insights and historical data tracking
- **Role-based Access**: Admin, manager, and employee permission levels

## Technology Stack

### Frontend
- Next.js 14 with App Router
- React 18 with TypeScript
- Tailwind CSS + shadcn/ui
- Zustand for state management
- React Query for data fetching

### Backend
- Express.js with TypeScript
- PostgreSQL with Drizzle ORM
- JWT authentication
- WebSocket for real-time updates
- Redis for caching (optional)

## Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd unified-leaderboard-platform
   npm run install:all
   ```

2. **Database Setup**
   ```bash
   # Copy environment file
   cp .env.example .env

   # Update database credentials in .env
   # Then run migrations
   npm run db:migrate
   npm run db:seed
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Project Structure

```
unified-leaderboard-platform/
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/       # App router pages
│   │   ├── components/ # Reusable components
│   │   ├── lib/       # Utilities and configurations
│   │   └── types/     # TypeScript definitions
├── backend/           # Express.js API server
│   ├── src/
│   │   ├── routes/    # API routes
│   │   ├── controllers/ # Business logic
│   │   ├── models/    # Database models
│   │   ├── middleware/ # Express middleware
│   │   └── utils/     # Utility functions
├── shared/            # Shared types and utilities
└── docs/             # Documentation
```

## Deployment

### Docker
```bash
docker-compose up -d
```

### Manual Deployment
1. Build the applications: `npm run build`
2. Set up PostgreSQL database
3. Configure environment variables
4. Start the applications: `npm run start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details
