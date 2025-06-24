-- Initial schema for Unified Leaderboard Platform
-- Generated: 2025-01-24

-- Create enums
CREATE TYPE user_type AS ENUM ('admin', 'manager', 'employee', 'sales_rep');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE leaderboard_type AS ENUM ('employee', 'sales', 'mixed');
CREATE TYPE metric_type AS ENUM ('points', 'revenue', 'deals', 'voice_seats', 'custom');
CREATE TYPE achievement_type AS ENUM ('milestone', 'streak', 'goal', 'recognition');

-- Organizations table
CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  settings TEXT, -- JSON string for org settings
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table (unified employees and sales reps)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id),
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE,
  password_hash VARCHAR(255),
  user_type user_type DEFAULT 'employee',
  status user_status DEFAULT 'active',
  department VARCHAR(100),
  territory VARCHAR(100), -- For sales reps
  manager VARCHAR(100),
  avatar TEXT,
  phone_number VARCHAR(20),
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for users table
CREATE UNIQUE INDEX users_email_idx ON users(email);
CREATE UNIQUE INDEX users_username_idx ON users(username);

-- Leaderboards table
CREATE TABLE leaderboards (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type leaderboard_type DEFAULT 'employee',
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  settings TEXT, -- JSON string for leaderboard configuration
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Metrics table (unified points and sales data)
CREATE TABLE metrics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  leaderboard_id INTEGER REFERENCES leaderboards(id),
  metric_type metric_type NOT NULL,
  value DECIMAL(12,2) NOT NULL,
  description TEXT,
  source VARCHAR(100), -- Where the metric came from
  weight DECIMAL(5,2) DEFAULT 1.0, -- For weighted calculations
  recorded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Achievements table
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type achievement_type DEFAULT 'milestone',
  icon VARCHAR(100),
  points_value INTEGER DEFAULT 0,
  criteria TEXT, -- JSON string for achievement criteria
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User achievements table (many-to-many)
CREATE TABLE user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  achievement_id INTEGER REFERENCES achievements(id),
  earned_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activity log table
CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  organization_id INTEGER REFERENCES organizations(id),
  action VARCHAR(100) NOT NULL,
  description TEXT,
  metadata TEXT, -- JSON string for additional data
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sales goals table
CREATE TABLE sales_goals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  leaderboard_id INTEGER REFERENCES leaderboards(id),
  metric_type metric_type NOT NULL,
  target_value DECIMAL(12,2) NOT NULL,
  current_value DECIMAL(12,2) DEFAULT 0,
  period VARCHAR(50) NOT NULL, -- 'monthly', 'quarterly', 'yearly'
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Leaderboard rankings cache table (for performance)
CREATE TABLE leaderboard_rankings (
  id SERIAL PRIMARY KEY,
  leaderboard_id INTEGER REFERENCES leaderboards(id),
  user_id INTEGER REFERENCES users(id),
  rank INTEGER NOT NULL,
  score DECIMAL(12,2) NOT NULL,
  previous_rank INTEGER,
  rank_change INTEGER,
  calculated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default organization
INSERT INTO organizations (name, slug, description, settings) VALUES 
('Default Organization', 'default', 'Default organization for unified leaderboard platform', '{}');

-- Insert default leaderboards
INSERT INTO leaderboards (organization_id, name, description, type, settings) VALUES 
(1, 'Employee Recognition Board', 'Points-based employee recognition and achievements', 'employee', '{"pointsWeight": 1.0, "achievementBonus": 50}'),
(1, 'Sales Performance Board', 'Revenue and deals tracking for sales team', 'sales', '{"revenueWeight": 1.0, "dealsWeight": 1000, "voiceSeatsWeight": 10}'),
(1, 'Unified Performance Board', 'Combined employee and sales performance metrics', 'mixed', '{"employeeWeight": 0.5, "salesWeight": 0.5}');

-- Insert sample achievements
INSERT INTO achievements (organization_id, name, description, type, icon, points_value, criteria) VALUES 
(1, 'First Steps', 'Complete your first task', 'milestone', '🎯', 50, '{"firstTask": true}'),
(1, 'Team Player', 'Help 5 colleagues this month', 'recognition', '🤝', 100, '{"helpCount": 5, "period": "monthly"}'),
(1, 'Sales Superstar', 'Exceed monthly revenue goal', 'goal', '⭐', 200, '{"revenueGoal": "exceed", "period": "monthly"}'),
(1, 'Consistency Champion', '7 day activity streak', 'streak', '🔥', 150, '{"streakDays": 7}');