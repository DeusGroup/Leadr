# Unified Leaderboard Platform - Frontend

This is the Next.js frontend application for the Unified Leaderboard Platform.

## Features

- Employee recognition leaderboards
- Sales performance tracking
- Real-time updates via WebSocket
- Responsive design with dark/light theme
- Interactive dashboards and analytics
- User management and authentication

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable components
│   ├── ui/             # Base UI components
│   ├── leaderboards/   # Leaderboard components
│   └── dashboard/      # Dashboard components
├── lib/                # Utilities and configurations
├── hooks/              # Custom React hooks
└── types/              # TypeScript type definitions
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NODE_ENV` - Environment (development/production)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
