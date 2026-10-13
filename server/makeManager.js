
require('dotenv').config()

const mongoose = require('mongoose')
const User = require('./models/User')

async function makeManager() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)

    const email = 'manager@teamflow.local'

    const user = await User.findOne({ email })

    if (!user) {
      console.log('Register this user as Developer first.')
      return
    }

    user.role = 'Project Manager'
    await user.save()

    console.log('Project Manager account ready:', user.email)
  } catch (error) {
    console.error(error.message)
  } finally {
    await mongoose.disconnect()
  }
}

makeManager()
