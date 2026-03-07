import { Router } from 'express'
import WorkExperience from '../models/work-experience.js'

const router = Router()

router.get('/', async (req, res) => {
  const experiences = await WorkExperience.find().sort({ startDate: -1 })
  res.json({ success: true, data: experiences })
})

router.post('/', async (req, res) => {
  const { company, role, startDate, endDate, current, description } = req.body
  const experience = await WorkExperience.create({ company, role, startDate, endDate, current, description })
  res.status(201).json({ success: true, data: experience })
})

router.put('/:id', async (req, res) => {
  const { company, role, startDate, endDate, current, description } = req.body
  const experience = await WorkExperience.findByIdAndUpdate(
    req.params.id,
    { company, role, startDate, endDate, current, description },
    { new: true }
  )
  res.json({ success: true, data: experience })
})

router.delete('/:id', async (req, res) => {
  await WorkExperience.findByIdAndDelete(req.params.id)
  res.json({ success: true })
})

export default router