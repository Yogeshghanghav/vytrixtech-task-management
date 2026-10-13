
const express = require('express')
const router = express.Router()

const {
  createTask,
  getTasks,
  updateTaskStatus,
} = require('../controllers/taskController')

const { protect } = require('../middleware/authMiddleware')
const { authorizeRoles } = require('../middleware/roleMiddleware')
router.patch('/:id/status', protect, updateTaskStatus)
router.route('/')
  .get(protect, getTasks)
  .post(protect, authorizeRoles('Admin', 'Project Manager'), createTask)

module.exports = router
