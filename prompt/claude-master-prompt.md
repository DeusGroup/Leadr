# MASTER CLAUDE PROMPT: Leadr Application Enhancement

## CONTEXT
You are tasked with enhancing an existing leaderboard SaaS application called "Leadr" that combines employee recognition and sales performance tracking. The current application has basic functionality but needs modern features to increase user engagement and business value.

## CURRENT APPLICATION STRUCTURE
```
- Main Page: Overview with key metrics
- Dashboard: Combined employee/sales metrics with recent activity
- Employee Leaderboard: Employee rankings with points/achievements
- Sales Leaderboard: Sales rep rankings with weighted scoring
```

## ABSOLUTE MUST-HAVE FEATURES TO IMPLEMENT

### 1. MICRO-LEADERBOARDS WITH SMART FILTERING
Create multiple leaderboard views to keep all users engaged:

**Implementation Requirements:**
- **Near Me View**: Show user's rank ±5 positions (e.g., ranks 12-22 if user is #17)
- **Time-based Filters**: Daily, Weekly, Monthly, Quarterly views
- **Department Filters**: Filter by Sales, Engineering, Marketing, etc.
- **Custom Metrics Toggle**: Allow users to switch between different scoring methods
- **Personal Progress Card**: Show individual user's trend (up/down arrows, percentage change)

**Technical Specs:**
- Use React hooks for filter state management
- Implement smooth transitions between different views (250ms ease-in-out)
- Add loading skeletons during filter changes
- Store filter preferences in localStorage

### 2. REAL-TIME FEATURES & GAMIFICATION
Transform static data into engaging real-time experience:

**Implementation Requirements:**
- **Live Activity Feed**: Real-time updates with WebSocket simulation (use setTimeout for demo)
- **Achievement System**: Badge notifications for milestones (1000 points, streak achievements)
- **Progress Animations**: Animated progress bars and counters
- **Confetti Effects**: Celebrate achievements with particle animations
- **Sound Effects**: Optional audio feedback for achievements (with mute toggle)

**Technical Specs:**
- Use Framer Motion for animations
- Implement React context for real-time state management
- Add intersection observer for scroll-triggered animations
- Create reusable animation components

### 3. PREDICTIVE INSIGHTS DASHBOARD
Add AI-powered analytics section:

**Implementation Requirements:**
- **Trend Predictions**: "Sarah is on track to exceed monthly goal by 15%"
- **Risk Alerts**: "3 team members haven't logged activity in 48 hours"
- **Goal Recommendations**: Smart goal suggestions based on historical data
- **Performance Forecasting**: Charts showing projected vs actual performance
- **Team Health Score**: Overall team engagement metric with breakdown

**Technical Specs:**
- Create mock AI logic functions
- Use Chart.js or Recharts for data visualization
- Implement color-coded alert system (green/yellow/red)
- Add tooltip explanations for all metrics

### 4. MODERN UI/UX ENHANCEMENTS
Apply 2025 design trends:

**Implementation Requirements:**
- **Glass-morphism Cards**: Semi-transparent cards with blur effects
- **Dark/Light Mode Toggle**: Complete theme switching
- **Micro-interactions**: Hover effects, button press animations, card flips
- **Responsive Bento Grid**: Dynamic card layouts that adapt to content
- **Loading States**: Skeleton loaders and smooth transitions

**Technical Specs:**
- Use CSS-in-JS (styled-components) or Tailwind CSS
- Implement CSS custom properties for theming
- Add prefers-color-scheme detection
- Create responsive breakpoints (mobile-first approach)

### 5. ENHANCED USER ONBOARDING
Create guided experience for new users:

**Implementation Requirements:**
- **Interactive Tutorial**: Step-by-step overlay guide
- **Progress Checklist**: Onboarding tasks with checkmarks
- **Demo Data**: Populate with sample data for first-time users
- **Feature Tooltips**: Contextual help throughout the app
- **Quick Wins**: Easy initial tasks to get users started

**Technical Specs:**
- Use React Joyride or similar library for guided tours
- Store onboarding progress in localStorage
- Create dismissible help overlays
- Add keyboard navigation support

## TECHNICAL REQUIREMENTS

### Technology Stack
```javascript
// Required Dependencies
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "framer-motion": "^10.0.0",
  "lucide-react": "^0.263.0", // For icons
  "clsx": "^2.0.0", // For conditional classes
  "recharts": "^2.7.2", // For charts
  "react-confetti": "^6.1.0" // For celebrations
}
```

### File Structure
```
src/
├── components/
│   ├── common/
│   │   ├── Card.jsx
│   │   ├── Button.jsx
│   │   ├── Badge.jsx
│   │   └── LoadingSkeleton.jsx
│   ├── leaderboard/
│   │   ├── LeaderboardTable.jsx
│   │   ├── LeaderboardFilters.jsx
│   │   ├── PersonalProgress.jsx
│   │   └── NearMeView.jsx
│   ├── dashboard/
│   │   ├── MetricsCards.jsx
│   │   ├── ActivityFeed.jsx
│   │   ├── PredictiveInsights.jsx
│   │   └── TrendCharts.jsx
│   └── onboarding/
│       ├── GuidedTour.jsx
│       └── ProgressChecklist.jsx
├── hooks/
│   ├── useRealTimeData.js
│   ├── useLeaderboardFilters.js
│   └── useAchievements.js
├── contexts/
│   ├── ThemeContext.js
│   └── UserContext.js
└── utils/
    ├── animations.js
    ├── mockData.js
    └── calculations.js
```

### Color Palette & Design System
```css
/* Light Theme */
:root {
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --secondary: #10b981;
  --background: #ffffff;
  --surface: #f8fafc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border: #e2e8f0;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --glass-bg: rgba(255, 255, 255, 0.8);
  --glass-border: rgba(255, 255, 255, 0.2);
}

/* Dark Theme */
[data-theme="dark"] {
  --primary: #60a5fa;
  --primary-hover: #3b82f6;
  --secondary: #34d399;
  --background: #0f172a;
  --surface: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --border: #334155;
  --glass-bg: rgba(30, 41, 59, 0.8);
  --glass-border: rgba(255, 255, 255, 0.1);
}
```

## SUCCESS CRITERIA
The enhanced application should demonstrate:
1. ✅ All users can see their progress (not just top performers)
2. ✅ Real-time updates and engaging animations
3. ✅ Predictive insights that provide business value
4. ✅ Modern, accessible UI that works on all devices
5. ✅ Smooth onboarding experience for new users
6. ✅ Performance optimizations (60fps animations, fast loading)

## IMPLEMENTATION NOTES
- Use mock data and setTimeout to simulate real-time updates
- Focus on user experience over complex backend logic
- Ensure all interactions provide immediate feedback
- Test thoroughly on mobile devices
- Add proper error handling and loading states
- Include accessibility features (ARIA labels, keyboard navigation)

## FINAL DELIVERABLE
A complete, modern SaaS leaderboard application that demonstrates enterprise-level UX design and engages users at all performance levels through personalization, gamification, and predictive insights.