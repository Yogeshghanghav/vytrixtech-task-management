
const express = require('express')
const cors = require('cors')
const http = require('http')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const { Server } = require('socket.io')

require('dotenv').config()

const connectDB = require('./config/db')
const User = require('./models/User')
const Project = require('./models/Project')
const Task = require('./models/Task')

const authRoutes = require('./routes/authRoutes')
const projectRoutes = require('./routes/projectRoutes')
const taskRoutes = require('./routes/taskRoutes')
const commentRoutes = require('./routes/commentRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const activityLogRoutes = require('./routes/activityLogRoutes')

const app = express()
const server = http.createServer(app)

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json())

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  },
})

app.set('io', io)

// Verify the JWT before allowing a Socket.IO connection.
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token

    if (!token) {
      return next(new Error('Authentication required'))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return next(new Error('User no longer exists'))
    }

    socket.user = user
    next()
  } catch (error) {
    next(new Error('Invalid or expired token'))
  }
})

io.on('connection', (socket) => {
  console.log(`Authenticated socket connected: ${socket.user._id}`)

  socket.on('join-project', async (projectId) => {
    try {
      if (
        typeof projectId !== 'string' ||
        !mongoose.Types.ObjectId.isValid(projectId)
      ) {
        return
      }

      const user = socket.user
      const project = await Project.findById(projectId)

      if (!project) {
        return
      }

      const role = String(user.role || '').toLowerCase()
      const userId = user._id.toString()

      const isAdmin = role === 'admin'

      const isProjectManager =
        role === 'project manager' &&
        (
          project.createdBy?.toString() === userId ||
          project.members.some((memberId) => memberId.toString() === userId)
        )

      const isProjectMember = project.members.some(
        (memberId) => memberId.toString() === userId
      )

      const hasAssignedTask = await Task.exists({
        project: project._id,
        assignedTo: user._id,
      })

      const isAuthorizedDeveloper =
        role === 'developer' && (isProjectMember || Boolean(hasAssignedTask))

      if (!isAdmin && !isProjectManager && !isAuthorizedDeveloper) {
        console.log(`Project room access denied for user ${userId}`)
        return
      }

      socket.join(`project:${project._id}`)
      console.log(`Socket joined project room: ${project._id}`)
    } catch (error) {
      console.error('Project room authorization failed:', error.message)
    }
  })

  socket.on('leave-project', (projectId) => {
    if (
      typeof projectId === 'string' &&
      mongoose.Types.ObjectId.isValid(projectId)
    ) {
      socket.leave(`project:${projectId}`)
    }
  })

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.user._id}`)
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/activity-logs', activityLogRoutes)

app.get('/api/debug', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Current server is running',
  })
})

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TeamFlow API is running',
  })
})

const PORT = process.env.PORT || 5000

async function startServer() {
  try {
    await connectDB()

    server.listen(PORT, () => {
      console.log(`TeamFlow API running on port ${PORT}`)
      console.log('Socket.IO authentication enabled')
    })
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}

startServer()
