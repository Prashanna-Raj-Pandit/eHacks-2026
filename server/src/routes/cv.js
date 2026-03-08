import { Router } from 'express'
import JD from '../models/jd.js'

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

router.post('/:id/generate', async (req, res) => {
  const jd = await JD.findById(req.params.id)
  if (!jd) return res.status(404).json({ success: false, error: 'JD not found' })

  try {
    const aiRes = await fetch('http://localhost:8000/api/docs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobDescription: jd.content }),
    })
    const data = await aiRes.json()
    jd.cv = data.cv
    await jd.save()
    res.json({ success: true, data: jd.cv })
  } catch (err) {
    res.status(500).json({ success: false, error: 'AI service unreachable' })
  }
})

export default router