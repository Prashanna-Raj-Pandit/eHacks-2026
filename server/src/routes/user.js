import { Router } from 'express'
import User from '../models/user.js'
import UploadMiddleware from '../middlewares/upload.js'
import fs from 'fs'
import path from 'path'
import WorkExperience from '../models/work-experience.js'
import Education from '../models/education.js'

const router = Router()

const SINGLE_USER_ID = process.env.SINGLE_USER_ID || null

router.post('/autofill-linkedin', async (req, res) => {
  try {
    const user = await User.findOne()
    if (!user?.linkedinPdf) {
      return res.status(400).json({ success: false, error: 'No LinkedIn PDF uploaded' })
    }

    // read pdf file and send as multipart to AI service
    const pdfPath = path.join(process.cwd(), 'public', 'uploads', user.linkedinPdf)
    const pdfBuffer = fs.readFileSync(pdfPath)
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' })
    
    const formData = new FormData()
    formData.append('file', blob, user.linkedinPdf)

    // send to AI
    const aiRes = await fetch('http://localhost:8000/api/extract-linkedin', {
      method: 'POST',
      body: formData,
    })
    const { data } = await aiRes.json()

    // save to DB
    const updatedUser = await User.findOneAndUpdate(
      {},
      {
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        phone: data.user.phone,
        bio: data.user.bio,
        location: data.user.location,
        skills: data.user.skills,
      },
      { new: true }
    )

    await WorkExperience.deleteMany({ source: 'linkedin' })
    const workExperience = await WorkExperience.insertMany(
      data.workExperience.map(exp => ({ ...exp, source: 'linkedin' }))
    )

    await Education.deleteMany({ source: 'linkedin' })
    const education = await Education.insertMany(
      data.education.map(edu => ({ ...edu, source: 'linkedin' }))
    )

    res.json({
      success: true,
      data: { user: updatedUser, workExperience, education }
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: err.message })
  }
})


// POST upload linkedin pdf
router.post('/linkedin', UploadMiddleware().single('linkedinPdf'), async (req, res) => {
  let user = await User.findOne()
  if (!user) user = await User.create({})
  
  user.linkedinPdf = req.file.filename
  await user.save()

  // TODO: send to AI service for extraction later

  res.json({ success: true, data: user })
})

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
  const { firstName, lastName, email, phone, bio, location, githubUsername, skills } = req.body
  user.set({ firstName, lastName, email, phone, bio, location, githubUsername, skills })
  await user.save()
  res.json({ success: true, data: user })
})

export default router