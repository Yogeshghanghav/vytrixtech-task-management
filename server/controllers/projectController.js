
const Project = require('../models/Project')
const Task = require('../models/Task')

const isAdmin = (user) =>
  String(user.role || '').toLowerCase() === 'admin'

const isProjectManager = (user) =>
  String(user.role || '').toLowerCase() === 'project manager'

const isDeveloper = (user) =>
  String(user.role || '').toLowerCase() === 'developer'

const isProjectMember = (project, userId) => {
  const id = userId.toString()

  return (
    project.createdBy?.toString() === id ||
    project.members.some((member) => member.toString() === id)
  )
}

const canManageProject = (project, user) =>
  isAdmin(user) ||
  (isProjectManager(user) && isProjectMember(project, user._id))

const canViewProject = async (project, user) => {
  if (canManageProject(project, user)) {
    return true
  }

  if (isDeveloper(user)) {
    if (isProjectMember(project, user._id)) {
      return true
    }

    return Boolean(
      await Task.exists({
        project: project._id,
        assignedTo: user._id,
      })
    )
  }

  return false
}

// Create project
exports.createProject = async (req, res) => {
  try {
    const { name, description, status, dueDate, members } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required',
      })
    }

    if (!isAdmin(req.user) && !isProjectManager(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to create projects',
      })
    }

    const projectData = {
      name: name.trim(),
      description,
      status,
      dueDate: dueDate || null,
      createdBy: req.user._id,
    }

    if (Array.isArray(members)) {
      projectData.members = members
    }

    const project = await Project.create(projectData)

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// Get projects visible to the current user
exports.getProjects = async (req, res) => {
  try {
    let projects

    if (isAdmin(req.user)) {
      projects = await Project.find().sort({ createdAt: -1 })
    } else if (isProjectManager(req.user)) {
      projects = await Project.find({
        $or: [
          { createdBy: req.user._id },
          { members: req.user._id },
        ],
      }).sort({ createdAt: -1 })
    } else if (isDeveloper(req.user)) {
      const assignedTasks = await Task.find({
        assignedTo: req.user._id,
      }).distinct('project')

      projects = await Project.find({
        $or: [
          { members: req.user._id },
          { _id: { $in: assignedTasks } },
        ],
      }).sort({ createdAt: -1 })
    } else {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to view projects',
      })
    }

    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    })
  } catch (error) {
    console.error('Get projects error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
    })
  }
}

// Get single project
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      })
    }

    if (!(await canViewProject(project, req.user))) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to view this project',
      })
    }

    return res.status(200).json({
      success: true,
      data: project,
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid project ID',
    })
  }
}

// Update project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      })
    }

    if (!canManageProject(project, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to update this project',
      })
    }

    const allowedFields = ['name', 'description', 'status', 'dueDate']

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field]
      }
    }

    await project.save()

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      })
    }

    if (!canManageProject(project, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to delete this project',
      })
    }

    await project.deleteOne()

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid project ID',
    })
  }
}
