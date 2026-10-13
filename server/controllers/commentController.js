
const Comment = require('../models/Comment')
const Task = require('../models/Task')
const Project = require('../models/Project')

const isAdmin = (user) =>
  String(user.role || '').toLowerCase() === 'admin'

const isProjectManager = (user) =>
  String(user.role || '').toLowerCase() === 'project manager'

const isDeveloper = (user) =>
  String(user.role || '').toLowerCase() === 'developer'

const canAccessTask = async (task, user) => {
  if (isAdmin(user)) {
    return true
  }

  if (isDeveloper(user)) {
    return task.assignedTo.toString() === user._id.toString()
  }

  if (isProjectManager(user)) {
    const project = await Project.findById(task.project)

    if (!project) {
      return false
    }

    const userId = user._id.toString()

    return (
      project.createdBy?.toString() === userId ||
      project.members.some((member) => member.toString() === userId)
    )
  }

  return false
}

// Add a comment to a task
const createComment = async (req, res) => {
  try {
    const { text } = req.body
    const { taskId } = req.params

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required',
      })
    }

    const task = await Task.findById(taskId)

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      })
    }

    if (!(await canAccessTask(task, req.user))) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to comment on this task',
      })
    }

    const comment = await Comment.create({
      task: task._id,
      user: req.user._id,
      text: text.trim(),
    })

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name email role')

    const io = req.app.get('io')

    if (io) {
      io.to(`project:${task.project.toString()}`).emit('comment-created', {
        taskId: task._id.toString(),
        comment: populatedComment,
      })
    }

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: populatedComment,
    })
  } catch (error) {
    console.error('Create comment error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to add comment',
    })
  }
}

// Get comments for a task
const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params
    const task = await Task.findById(taskId)

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      })
    }

    if (!(await canAccessTask(task, req.user))) {
      return res.status(403).json({
        success: false,
        message: 'You cannot view comments for this task',
      })
    }

    const comments = await Comment.find({ task: task._id })
      .populate('user', 'name email role')
      .sort({ createdAt: 1 })

    return res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    })
  } catch (error) {
    console.error('Get comments error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch comments',
    })
  }
}

module.exports = {
  createComment,
  getTaskComments,
}
