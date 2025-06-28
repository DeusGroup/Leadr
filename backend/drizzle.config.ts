import type { Config } from 'drizzle-kit'

export default {
  schema: './src/models/sqliteSchema.ts',
  out: './drizzle',
  driver: 'better-sqlite3',
  dbCredentials: {
    url: './data/leaderboard.db',
  },
} satisfies Config
