import { Router } from 'express'

const router = Router()

// in-memory for now, swap with mongoose later
let jds = []

// GET all JDs
router.get('/', (req, res) => {
  res.json({ success: true, data: jds })
})

// POST create JD
router.post('/', (req, res) => {
  const { title, content } = req.body
  const jd = { id: Date.now(), title, content, cv: null }
  jds.push(jd)
  res.status(201).json({ success: true, data: jd })
})

// PUT update JD
router.put('/:id', (req, res) => {
  const { title, content } = req.body
  jds = jds.map(j => j.id === Number(req.params.id) ? { ...j, title, content } : j)
  const updated = jds.find(j => j.id === Number(req.params.id))
  res.json({ success: true, data: updated })
})

// DELETE jd
router.delete('/:id', (req, res) => {
  jds = jds.filter(j => j.id !== Number(req.params.id))
  res.json({ success: true })
})

// POST generate CV — calls python AI service
router.post('/:id/generate', async (req, res) => {
  const jd = jds.find(j => j.id === Number(req.params.id))
  if (!jd) return res.status(404).json({ success: false, error: 'JD not found' })

  try {
    const aiRes = await fetch('http://localhost:8000/api/generate-cv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobDescription: jd.content }),
    })
    const data = await aiRes.json()
    jds = jds.map(j => j.id === Number(req.params.id) ? { ...j, cv: data.cv } : j)
    res.json({ success: true, data: data.cv })
  } catch (err) {
    res.status(500).json({ success: false, error: 'AI service unreachable' })
  }
})

export default router