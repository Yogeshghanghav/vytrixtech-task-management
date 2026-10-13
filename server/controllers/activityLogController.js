
const ActivityLog = require('../models/ActivityLog')
const Project = require('../models/Project')

const getActivityLogs = async (req, res) => {
  try {
    const role = String(req.user?.role || '').toLowerCase()

    let filter = {}

    if (role === 'admin') {
      filter = {}
    } else if (role === 'project manager') {
      const projects = await Project.find({
        $or: [
          { createdBy: req.user._id },
          { members: req.user._id },
        ],
      }).select('_id')

      const projectIds = projects.map((project) => project._id)

      filter = {
        project: { $in: projectIds },
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to view activity logs',
      })
    }

    const logs = await ActivityLog.find(filter)
      .populate('user', 'name email role')
      .populate('project', 'name')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .limit(50)

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    })
  } catch (error) {
    console.error('Get activity logs error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch activity logs',
    })
  }
}

module.exports = { getActivityLogs }
