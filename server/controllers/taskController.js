
const Task = require('../models/Task')
const Project = require('../models/Project')
const User = require('../models/User')
const ActivityLog = require('../models/ActivityLog')

const isAdmin = (user) =>
  String(user.role || '').toLowerCase() === 'admin'

const isProjectManager = (user) =>
  String(user.role || '').toLowerCase() === 'project manager'

const isProjectMember = (project, userId) => {
  const id = userId.toString()

  return (
    project.createdBy?.toString() === id ||
    project.members.some((member) => member.toString() === id)
  )
}
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      project: projectId,
      assignedTo,
      priority,
      dueDate,
    } = req.body

    if (!title || !projectId || !assignedTo || !dueDate) {
      return res.status(400).json({
        success: false,
        message:
          'Title, project, assigned developer and due date are required',
      })
    }

    if (!['Admin', 'Project Manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to create tasks',
      })
    }

    const project = await Project.findById(projectId)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      })
    }

    if (!isAdmin(req.user) && !isProjectMember(project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You cannot create tasks for this project',
      })
    }

    const developer = await User.findById(assignedTo)

    if (!developer || developer.role !== 'Developer') {
      return res.status(400).json({
        success: false,
        message: 'Please assign the task to a valid developer',
      })
    }

    const task = await Task.create({
      title,
      description,
      project: project._id,
      assignedTo,
      assignedBy: req.user._id,
      priority,
      dueDate,
    })

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role')

    const io = req.app.get('io')

    if (io) {
      io.to(`project:${project._id}`)
        .to(`user:${developer._id}`)
        .emit('task-created', { task: populatedTask })
    }

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: populatedTask,
    })
  } catch (error) {
    console.error('Create task error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to create task',
    })
  }
}
const getTasks = async (req, res) => {
  try {
    let filter = {}

    if (String(req.user.role).toLowerCase() === 'developer') {
      filter = { assignedTo: req.user._id }
    } else if (isProjectManager(req.user)) {
      const projects = await Project.find({
        $or: [
          { createdBy: req.user._id },
          { members: req.user._id },
        ],
      }).select('_id')

      filter = {
        project: { $in: projects.map((project) => project._id) },
      }
    } else if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to view tasks',
      })
    }

    const tasks = await Task.find(filter)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    })
  } catch (error) {
    console.error('Get tasks error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch tasks',
    })
  }
}

// Update task status
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body
    const allowedStatuses = ['Todo', 'In Progress', 'Completed']

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task status',
      })
    }

    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      })
    }

    const role = String(req.user.role || '').toLowerCase()
    const isAssignedDeveloper =
      role === 'developer' &&
      task.assignedTo.toString() === req.user._id.toString()

    let canUpdate = isAssignedDeveloper || isAdmin(req.user)

    if (isProjectManager(req.user)) {
      const project = await Project.findById(task.project)

      canUpdate = Boolean(
        project && isProjectMember(project, req.user._id)
      )
    }

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to update this task',
      })
    }

    task.status = status
    await task.save()

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')

    await ActivityLog.create({
      user: req.user._id,
      project: task.project,
      task: task._id,
      action: 'Task status updated',
      details: `Task "${task.title}" status changed to "${status}"`,
    })

    const io = req.app.get('io')

    if (io) {
      io.to(`project:${task.project.toString()}`).emit('task-updated', {
        task: populatedTask,
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: populatedTask,
    })
  } catch (error) {
    console.error('Update task status error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to update task status',
    })
  }
}

module.exports = {
  createTask,
  getTasks,
  updateTaskStatus,
}
