import { 
  sqliteTable, 
  integer, 
  text, 
  real, 
  uniqueIndex
} from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

// Organizations table
export const organizations = sqliteTable('organizations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  settings: text('settings'), // JSON string for org settings
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(Date.now()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(Date.now()),
})

// Users table (unified employees and sales reps)
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  organizationId: integer('organization_id').references(() => organizations.id),
  email: text('email').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  username: text('username').unique(),
  passwordHash: text('password_hash'),
  userType: text('user_type', { enum: ['admin', 'manager', 'employee', 'sales_rep'] }).default('employee'),
  status: text('status', { enum: ['active', 'inactive', 'suspended'] }).default('active'),
  department: text('department'),
  territory: text('territory'), // For sales reps
  manager: text('manager'),
  avatar: text('avatar'),
  phoneNumber: text('phone_number'),
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(Date.now()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(Date.now()),
}, (table) => ({
  emailIndex: uniqueIndex('users_email_idx').on(table.email),
  usernameIndex: uniqueIndex('users_username_idx').on(table.username),
}))

// Leaderboards table
export const leaderboards = sqliteTable('leaderboards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  organizationId: integer('organization_id').references(() => organizations.id),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type', { enum: ['employee', 'sales', 'mixed'] }).default('employee'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  startDate: integer('start_date', { mode: 'timestamp' }),
  endDate: integer('end_date', { mode: 'timestamp' }),
  settings: text('settings'), // JSON string for leaderboard configuration
  createdAt: integer('created_at', { mode: 'timestamp' }).default(Date.now()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(Date.now()),
})

// Metrics table (unified points and sales data)
export const metrics = sqliteTable('metrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  leaderboardId: integer('leaderboard_id').references(() => leaderboards.id),
  metricType: text('metric_type', { enum: ['points', 'revenue', 'deals', 'voice_seats', 'custom'] }).notNull(),
  value: real('value').notNull(),
  description: text('description'),
  source: text('source'), // Where the metric came from
  weight: real('weight').default(1.0), // For weighted calculations
  recordedAt: integer('recorded_at', { mode: 'timestamp' }).default(Date.now()),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(Date.now()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(Date.now()),
})

// Achievements table
export const achievements = sqliteTable('achievements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  organizationId: integer('organization_id').references(() => organizations.id),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type', { enum: ['milestone', 'streak', 'goal', 'recognition'] }).default('milestone'),
  icon: text('icon'),
  pointsValue: integer('points_value').default(0),
  criteria: text('criteria'), // JSON string for achievement criteria
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(Date.now()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(Date.now()),
})

// User achievements table (many-to-many)
export const userAchievements = sqliteTable('user_achievements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  achievementId: integer('achievement_id').references(() => achievements.id),
  earnedAt: integer('earned_at', { mode: 'timestamp' }).default(Date.now()),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(Date.now()),
})

// Activity log table
export const activityLogs = sqliteTable('activity_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  organizationId: integer('organization_id').references(() => organizations.id),
  action: text('action').notNull(),
  description: text('description'),
  metadata: text('metadata'), // JSON string for additional data
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(Date.now()),
})

// Sales goals table
export const salesGoals = sqliteTable('sales_goals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  leaderboardId: integer('leaderboard_id').references(() => leaderboards.id),
  metricType: text('metric_type', { enum: ['points', 'revenue', 'deals', 'voice_seats', 'custom'] }).notNull(),
  targetValue: real('target_value').notNull(),
  currentValue: real('current_value').default(0),
  period: text('period').notNull(), // 'monthly', 'quarterly', 'yearly'
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(Date.now()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(Date.now()),
})

// Leaderboard rankings cache table (for performance)
export const leaderboardRankings = sqliteTable('leaderboard_rankings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  leaderboardId: integer('leaderboard_id').references(() => leaderboards.id),
  userId: integer('user_id').references(() => users.id),
  rank: integer('rank').notNull(),
  score: real('score').notNull(),
  previousRank: integer('previous_rank'),
  rankChange: integer('rank_change'),
  calculatedAt: integer('calculated_at', { mode: 'timestamp' }).default(Date.now()),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(Date.now()),
})

// Define relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  leaderboards: many(leaderboards),
  achievements: many(achievements),
  activityLogs: many(activityLogs),
}))

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  metrics: many(metrics),
  userAchievements: many(userAchievements),
  activityLogs: many(activityLogs),
  salesGoals: many(salesGoals),
  leaderboardRankings: many(leaderboardRankings),
}))

export const leaderboardsRelations = relations(leaderboards, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [leaderboards.organizationId],
    references: [organizations.id],
  }),
  metrics: many(metrics),
  salesGoals: many(salesGoals),
  leaderboardRankings: many(leaderboardRankings),
}))

export const metricsRelations = relations(metrics, ({ one }) => ({
  user: one(users, {
    fields: [metrics.userId],
    references: [users.id],
  }),
  leaderboard: one(leaderboards, {
    fields: [metrics.leaderboardId],
    references: [leaderboards.id],
  }),
}))

export const achievementsRelations = relations(achievements, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [achievements.organizationId],
    references: [organizations.id],
  }),
  userAchievements: many(userAchievements),
}))

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}))

export const salesGoalsRelations = relations(salesGoals, ({ one }) => ({
  user: one(users, {
    fields: [salesGoals.userId],
    references: [users.id],
  }),
  leaderboard: one(leaderboards, {
    fields: [salesGoals.leaderboardId],
    references: [leaderboards.id],
  }),
}))

export const leaderboardRankingsRelations = relations(leaderboardRankings, ({ one }) => ({
  user: one(users, {
    fields: [leaderboardRankings.userId],
    references: [users.id],
  }),
  leaderboard: one(leaderboards, {
    fields: [leaderboardRankings.leaderboardId],
    references: [leaderboards.id],
  }),
}))