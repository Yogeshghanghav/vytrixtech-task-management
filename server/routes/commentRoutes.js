
const express = require('express')
const router = express.Router()

const {
  createComment,
  getTaskComments,
} = require('../controllers/commentController')

const { protect } = require('../middleware/authMiddleware')

router.get('/test', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Comment routes working',
  })
})

router.route('/:taskId')
  .get(protect, getTaskComments)
  .post(protect, createComment)

module.exports = router
