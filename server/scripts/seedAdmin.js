
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const User = require('../models/User')

const seedAdmin = async () => {
  try {
    // Match the variable name already used in your .env file.
    const mongoUri = process.env.MONGODB_URI
    const adminName = process.env.ADMIN_NAME?.trim()
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!mongoUri || !adminName || !adminEmail || !adminPassword) {
      throw new Error(
        'Missing environment variables: MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD'
      )
    }

    if (adminPassword.length < 8) {
      throw new Error('ADMIN_PASSWORD must be at least 8 characters.')
    }

    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB.')

    let user = await User.findOne({ email: adminEmail })

    if (user) {
      user.role = 'Admin'
      await user.save()

      console.log('Existing account promoted to Admin.')
      console.log(`Admin email: ${user.email}`)
      console.log('Existing password was not changed.')
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, 12)

      user = await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'Admin',
      })

      console.log('New Admin account created.')
      console.log(`Admin email: ${user.email}`)
    }

    console.log('Admin seed completed successfully.')
  } catch (error) {
    console.error('Admin seed failed:', error.message)
    process.exitCode = 1
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }
  }
}

seedAdmin()
