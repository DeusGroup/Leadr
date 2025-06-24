import express from 'express'
import cors from 'cors'
import { createServer } from 'http'

const app = express()
const server = createServer(app)
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Leadr API Server Running',
    timestamp: new Date().toISOString(),
    database: 'SQLite (browser-ready)'
  })
})

// Mock API endpoints for demo
app.get('/api/leaderboards', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Employee Recognition Board',
      type: 'employee',
      description: 'Points-based employee recognition and achievements'
    },
    {
      id: 2,
      name: 'Sales Performance Board', 
      type: 'sales',
      description: 'Revenue and deals tracking for sales team'
    }
  ])
})

app.get('/api/users', (req, res) => {
  res.json([
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      userType: 'employee',
      department: 'Engineering'
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      userType: 'sales_rep',
      department: 'Sales'
    }
  ])
})

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Leadr API Server running on port ${PORT}`)
  console.log(`🗄️  Database: SQLite (browser-ready)`)
  console.log(`🌐 Health check: http://localhost:${PORT}/health`)
  console.log(`📊 API ready for frontend connection`)
})