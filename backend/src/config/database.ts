import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../models/schema'
import { logger } from '../utils/logger'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Create the connection
const client = postgres(connectionString, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
})

// Create the database instance
export const db = drizzle(client, { schema })

export async function connectDatabase() {
  try {
    // Test the connection
    await client`SELECT 1`
    logger.info('Database connected successfully')
  } catch (error) {
    logger.error('Database connection failed:', error)
    throw error
  }
}
