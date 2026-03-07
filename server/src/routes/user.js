import { Router } from 'express'
import User from '../models/user.js'

const router = Router()

const SINGLE_USER_ID = process.env.SINGLE_USER_ID || null

// GET profile
router.get('/profile', async (req, res) => {
  let user = await User.findById(SINGLE_USER_ID).catch(() => null)
  if (!user) user = await User.findOne()
  if (!user) user = await User.create({})
  res.json({ success: true, data: user })
})

// PUT update profile
router.put('/profile', async (req, res) => {
  let user = await User.findOne()
  if (!user) user = await User.create({})
  const { firstName, lastName, email, phone, bio, location } = req.body
  user.set({ firstName, lastName, email, phone, bio, location })
  await user.save()
  res.json({ success: true, data: user })
})

export default router