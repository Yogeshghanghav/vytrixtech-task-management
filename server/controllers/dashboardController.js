
const Project = require('../models/Project')
const Task = require('../models/Task')
const ActivityLog = require('../models/ActivityLog')

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date()

    const totalProjects = await Project.countDocuments()
    const totalTasks = await Task.countDocuments()

    const pendingTasks = await Task.countDocuments({
      status: { $ne: 'Completed' },
    })

    const completedTasks = await Task.countDocuments({
      status: 'Completed',
    })

    const overdueTasks = await Task.countDocuments({
      status: { $ne: 'Completed' },
      dueDate: { $lt: now },
    })

    const recentTasks = await Task.find()
      .populate('project', 'name')
      .populate('assignedTo', 'name')
      .sort({ updatedAt: -1 })
      .limit(5)
      const recentActivity = await ActivityLog.find()
  .populate('user', 'name email role')
  .populate('project', 'name')
  .populate('task', 'title')
  .sort({ createdAt: -1 })
  .limit(5)

    return res.status(200).json({
      success: true,
      data: {
        totalProjects,
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
        recentTasks,
         recentActivity,
      },
    })
  } catch (error) {
    console.error('Dashboard stats error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch dashboard statistics',
    })
  }
}

module.exports = { getDashboardStats }
