const express = require('express')
const router = express.Router()

const { getDevelopers } = require('../controllers/userController')
const { protect } = require('../middleware/authMiddleware')
const { authorizeRoles } = require('../middleware/roleMiddleware')

router.get(
  '/developers',
  protect,
  authorizeRoles('Admin', 'Project Manager'),
  getDevelopers
)

module.exports = router
