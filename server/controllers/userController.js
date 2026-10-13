const User = require('../models/User')
const getDevelopers = async (req, res) => {
  try {
    const developers = await User.find({ role: 'Developer' })
      .select('name email')
      .sort({ name: 1 })

    return res.status(200).json({
      success: true,
      count: developers.length,
      data: developers,
    })
  } catch (error) {
    console.error('Get developers error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to load developers',
    })
  }
}

module.exports = { getDevelopers }
