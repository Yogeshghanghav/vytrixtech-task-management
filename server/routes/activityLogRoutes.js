
const express = require('express')
const router = express.Router()

const { getActivityLogs } = require('../controllers/activityLogController')
const { protect } = require('../middleware/authMiddleware')
const { authorizeRoles } = require('../middleware/roleMiddleware')

router.get(
  '/',
  protect,
  authorizeRoles('Admin', 'Project Manager'),
  getActivityLogs
)

module.exports = router
