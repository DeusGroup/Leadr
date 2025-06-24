import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from '../models/sqliteSchema'
import { logger } from '../utils/logger'
import path from 'path'
import fs from 'fs'

// Create data directory if it doesn't exist
const dataDir = path.join(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// SQLite database file path
const dbPath = path.join(dataDir, 'leaderboard.db')

// Create the SQLite connection
const sqlite = new Database(dbPath)

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL')

// Create the database instance
export const db = drizzle(sqlite, { schema })

export async function connectDatabase() {
  try {
    // Test the connection by running a simple query
    const result = sqlite.prepare('SELECT 1').get()
    logger.info(`Database connected successfully at: ${dbPath}`)
    return result
  } catch (error) {
    logger.error('Database connection failed:', error)
    throw error
  }
}

export async function initializeDatabase() {
  try {
    logger.info('Initializing database with schema...')
    
    // Run the schema creation SQL
    const schemaSQL = `
      -- Create tables if they don't exist
      CREATE TABLE IF NOT EXISTS organizations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        settings TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id INTEGER REFERENCES organizations(id),
        email TEXT NOT NULL UNIQUE,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        username TEXT UNIQUE,
        password_hash TEXT,
        user_type TEXT DEFAULT 'employee' CHECK(user_type IN ('admin', 'manager', 'employee', 'sales_rep')),
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
        department TEXT,
        territory TEXT,
        manager TEXT,
        avatar TEXT,
        phone_number TEXT,
        last_login_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS leaderboards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id INTEGER REFERENCES organizations(id),
        name TEXT NOT NULL,
        description TEXT,
        type TEXT DEFAULT 'employee' CHECK(type IN ('employee', 'sales', 'mixed')),
        is_active INTEGER DEFAULT 1,
        start_date DATETIME,
        end_date DATETIME,
        settings TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        leaderboard_id INTEGER REFERENCES leaderboards(id),
        metric_type TEXT NOT NULL CHECK(metric_type IN ('points', 'revenue', 'deals', 'voice_seats', 'custom')),
        value DECIMAL(12,2) NOT NULL,
        description TEXT,
        source TEXT,
        weight DECIMAL(5,2) DEFAULT 1.0,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id INTEGER REFERENCES organizations(id),
        name TEXT NOT NULL,
        description TEXT,
        type TEXT DEFAULT 'milestone' CHECK(type IN ('milestone', 'streak', 'goal', 'recognition')),
        icon TEXT,
        points_value INTEGER DEFAULT 0,
        criteria TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        achievement_id INTEGER REFERENCES achievements(id),
        earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        organization_id INTEGER REFERENCES organizations(id),
        action TEXT NOT NULL,
        description TEXT,
        metadata TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sales_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        leaderboard_id INTEGER REFERENCES leaderboards(id),
        metric_type TEXT NOT NULL CHECK(metric_type IN ('points', 'revenue', 'deals', 'voice_seats', 'custom')),
        target_value DECIMAL(12,2) NOT NULL,
        current_value DECIMAL(12,2) DEFAULT 0,
        period TEXT NOT NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS leaderboard_rankings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        leaderboard_id INTEGER REFERENCES leaderboards(id),
        user_id INTEGER REFERENCES users(id),
        rank INTEGER NOT NULL,
        score DECIMAL(12,2) NOT NULL,
        previous_rank INTEGER,
        rank_change INTEGER,
        calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Insert default data if not exists
      INSERT OR IGNORE INTO organizations (id, name, slug, description, settings) VALUES 
      (1, 'Default Organization', 'default', 'Default organization for unified leaderboard platform', '{}');

      INSERT OR IGNORE INTO leaderboards (id, organization_id, name, description, type, settings) VALUES 
      (1, 1, 'Employee Recognition Board', 'Points-based employee recognition and achievements', 'employee', '{"pointsWeight": 1.0, "achievementBonus": 50}'),
      (2, 1, 'Sales Performance Board', 'Revenue and deals tracking for sales team', 'sales', '{"revenueWeight": 1.0, "dealsWeight": 1000, "voiceSeatsWeight": 10}'),
      (3, 1, 'Unified Performance Board', 'Combined employee and sales performance metrics', 'mixed', '{"employeeWeight": 0.5, "salesWeight": 0.5}');

      INSERT OR IGNORE INTO achievements (id, organization_id, name, description, type, icon, points_value, criteria) VALUES 
      (1, 1, 'First Steps', 'Complete your first task', 'milestone', '🎯', 50, '{"firstTask": true}'),
      (2, 1, 'Team Player', 'Help 5 colleagues this month', 'recognition', '🤝', 100, '{"helpCount": 5, "period": "monthly"}'),
      (3, 1, 'Sales Superstar', 'Exceed monthly revenue goal', 'goal', '⭐', 200, '{"revenueGoal": "exceed", "period": "monthly"}'),
      (4, 1, 'Consistency Champion', '7 day activity streak', 'streak', '🔥', 150, '{"streakDays": 7}');

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);
      CREATE INDEX IF NOT EXISTS idx_metrics_user ON metrics(user_id);
      CREATE INDEX IF NOT EXISTS idx_metrics_type ON metrics(metric_type);
      CREATE INDEX IF NOT EXISTS idx_metrics_recorded ON metrics(recorded_at);
      CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
    `

    // Execute the schema SQL
    sqlite.exec(schemaSQL)
    
    logger.info('Database schema initialized successfully')
  } catch (error) {
    logger.error('Database initialization failed:', error)
    throw error
  }
}

// Initialize database on import
initializeDatabase().catch(console.error)