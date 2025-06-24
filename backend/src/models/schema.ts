import { 
  pgTable, 
  serial, 
  varchar, 
  text, 
  integer, 
  decimal, 
  boolean, 
  timestamp, 
  pgEnum,
  uniqueIndex
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Enums
export const userTypeEnum = pgEnum('user_type', ['admin', 'manager', 'employee', 'sales_rep'])
export const userStatusEnum = pgEnum('user_status', ['active', 'inactive', 'suspended'])
export const leaderboardTypeEnum = pgEnum('leaderboard_type', ['employee', 'sales', 'mixed'])
export const metricTypeEnum = pgEnum('metric_type', ['points', 'revenue', 'deals', 'voice_seats', 'custom'])
export const achievementTypeEnum = pgEnum('achievement_type', ['milestone', 'streak', 'goal', 'recognition'])

// Organizations table
export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  settings: text('settings'), // JSON string for org settings
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Users table (unified employees and sales reps)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id),
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  username: varchar('username', { length: 50 }).unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  userType: userTypeEnum('user_type').default('employee'),
  status: userStatusEnum('status').default('active'),
  department: varchar('department', { length: 100 }),
  territory: varchar('territory', { length: 100 }), // For sales reps
  manager: varchar('manager', { length: 100 }),
  avatar: text('avatar'),
  phoneNumber: varchar('phone_number', { length: 20 }),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    emailIndex: uniqueIndex('users_email_idx').on(table.email),
    usernameIndex: uniqueIndex('users_username_idx').on(table.username),
  }
})

// Leaderboards table
export const leaderboards = pgTable('leaderboards', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: leaderboardTypeEnum('type').default('employee'),
  isActive: boolean('is_active').default(true),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  settings: text('settings'), // JSON string for leaderboard configuration
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Metrics table (unified points and sales data)
export const metrics = pgTable('metrics', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  leaderboardId: integer('leaderboard_id').references(() => leaderboards.id),
  metricType: metricTypeEnum('metric_type').notNull(),
  value: decimal('value', { precision: 12, scale: 2 }).notNull(),
  description: text('description'),
  source: varchar('source', { length: 100 }), // Where the metric came from
  weight: decimal('weight', { precision: 5, scale: 2 }).default('1.0'), // For weighted calculations
  recordedAt: timestamp('recorded_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Achievements table
export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: achievementTypeEnum('type').default('milestone'),
  icon: varchar('icon', { length: 100 }),
  pointsValue: integer('points_value').default(0),
  criteria: text('criteria'), // JSON string for achievement criteria
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// User achievements table (many-to-many)
export const userAchievements = pgTable('user_achievements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  achievementId: integer('achievement_id').references(() => achievements.id),
  earnedAt: timestamp('earned_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
})

// Activity log table
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  organizationId: integer('organization_id').references(() => organizations.id),
  action: varchar('action', { length: 100 }).notNull(),
  description: text('description'),
  metadata: text('metadata'), // JSON string for additional data
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Sales goals table
export const salesGoals = pgTable('sales_goals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  leaderboardId: integer('leaderboard_id').references(() => leaderboards.id),
  metricType: metricTypeEnum('metric_type').notNull(),
  targetValue: decimal('target_value', { precision: 12, scale: 2 }).notNull(),
  currentValue: decimal('current_value', { precision: 12, scale: 2 }).default('0'),
  period: varchar('period', { length: 50 }).notNull(), // 'monthly', 'quarterly', 'yearly'
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Leaderboard rankings cache table (for performance)
export const leaderboardRankings = pgTable('leaderboard_rankings', {
  id: serial('id').primaryKey(),
  leaderboardId: integer('leaderboard_id').references(() => leaderboards.id),
  userId: integer('user_id').references(() => users.id),
  rank: integer('rank').notNull(),
  score: decimal('score', { precision: 12, scale: 2 }).notNull(),
  previousRank: integer('previous_rank'),
  rankChange: integer('rank_change'),
  calculatedAt: timestamp('calculated_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
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
