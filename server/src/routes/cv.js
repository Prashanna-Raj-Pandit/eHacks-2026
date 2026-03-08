import { Router } from 'express'
import JD from '../models/jd.js'
import fs from 'fs'
import path from 'path'
import Document from '../models/document.js'
import User from '../models/user.js'

const router = Router()

router.get('/', async (req, res) => {
  const jds = await JD.find().sort({ createdAt: -1 })
  res.json({ success: true, data: jds })
})

router.post('/', async (req, res) => {
  const { title, content } = req.body
  const jd = await JD.create({ title, content })
  res.status(201).json({ success: true, data: jd })
})

router.put('/:id', async (req, res) => {
  const { title, content } = req.body
  const jd = await JD.findByIdAndUpdate(req.params.id, { title, content }, { new: true })
  res.json({ success: true, data: jd })
})

router.delete('/:id', async (req, res) => {
  await JD.findByIdAndDelete(req.params.id)
  res.json({ success: true })
})

// inside the generate route
router.post('/:id/generate', async (req, res) => {
  const jd = await JD.findById(req.params.id)
  if (!jd) return res.status(404).json({ success: false, error: 'JD not found' })

  try {
    // get user and their uploaded documents
    const user = await User.findOne()
    const documents = await Document.find()

    const formData = new FormData()

    // job description fields
    formData.append('job_description', jd.content)
    formData.append('target_role', jd.title)

    // append all uploaded reference documents
    for (const doc of documents) {
      const filePath = path.join(process.cwd(), 'public', 'uploads', doc.filename)
      if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath)
        const blob = new Blob([buffer], { type: doc.mimetype })
        formData.append('files', blob, doc.originalname)
      }
    }

    // append linkedin pdf if exists
    if (user?.linkedinPdf) {
      const linkedinPath = path.join(process.cwd(), 'public', 'uploads', user.linkedinPdf)
      if (fs.existsSync(linkedinPath)) {
        const buffer = fs.readFileSync(linkedinPath)
        const blob = new Blob([buffer], { type: 'application/pdf' })
        formData.append('files', blob, user.linkedinPdf)
      }
    }

    const aiRes = await fetch('http://localhost:8000/api/resume-generator', {
      method: 'POST',
      body: formData,
    })

    const data = await aiRes.json()
jd.cv = data.data.latex
await jd.save()
res.json({ success: true, data: jd.cv })

  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: 'AI service unreachable' })
  }
})

export default router