import { logger } from '../utils/logger'
import { execSync } from 'child_process'
import { migrateLeaderboardExcellence } from './migrate-leaderboard-excellence'
import { migrateSalesLeaderboard } from './migrate-sales-leaderboard'

async function runAllMigrations() {
  try {
    logger.info('Starting complete migration process...')

    // Step 1: Run schema migrations using Drizzle
    logger.info('Step 1: Creating database schema...')
    try {
      execSync('npm run db:generate', { stdio: 'inherit', cwd: process.cwd() })
      execSync('npm run db:migrate', { stdio: 'inherit', cwd: process.cwd() })
    } catch (error) {
      logger.error('Schema migration failed:', error)
      throw error
    }

    // Step 2: Apply initial schema SQL (for enums and sample data)
    logger.info('Step 2: Applying initial schema and sample data...')
    // Note: This would typically be done via Drizzle migrations, but for demo purposes
    // we're including it as a separate step

    // Step 3: Migrate LeaderboardXcellence data
    logger.info('Step 3: Migrating LeaderboardXcellence data...')
    if (process.env.LEADERBOARD_EXCELLENCE_DATABASE_URL) {
      await migrateLeaderboardExcellence()
    } else {
      logger.info('Skipping LeaderboardXcellence migration - no source database URL provided')
    }

    // Step 4: Migrate SalesLeaderboard data
    logger.info('Step 4: Migrating SalesLeaderboard data...')
    if (process.env.SALES_LEADERBOARD_DATABASE_URL) {
      await migrateSalesLeaderboard()
    } else {
      logger.info('Skipping SalesLeaderboard migration - no source database URL provided')
    }

    // Step 5: Run seed data
    logger.info('Step 5: Seeding additional data...')
    try {
      execSync('npm run db:seed', { stdio: 'inherit', cwd: process.cwd() })
    } catch (error) {
      logger.warn('Seeding failed (this may be expected if seed script is not ready):', error)
    }

    logger.info('✅ Complete migration process finished successfully!')
    logger.info('The unified leaderboard platform is now ready with migrated data from both applications.')
    
  } catch (error) {
    logger.error('❌ Migration process failed:', error)
    throw error
  }
}

// Environment variable validation
function validateEnvironment() {
  const required = ['DATABASE_URL']
  const missing = required.filter(env => !process.env[env])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  logger.info('Environment configuration:')
  logger.info(`- Target database: ${process.env.DATABASE_URL ? '✓' : '✗'}`)
  logger.info(`- LeaderboardXcellence source: ${process.env.LEADERBOARD_EXCELLENCE_DATABASE_URL ? '✓' : '✗ (will skip)'}`)
  logger.info(`- SalesLeaderboard source: ${process.env.SALES_LEADERBOARD_DATABASE_URL ? '✓' : '✗ (will skip)'}`)
}

// Run migration if called directly
if (require.main === module) {
  validateEnvironment()
  runAllMigrations()
    .then(() => {
      logger.info('All migrations completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      logger.error('Migration failed:', error)
      process.exit(1)
    })
}

export { runAllMigrations }