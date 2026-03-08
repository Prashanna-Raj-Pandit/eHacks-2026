import { Router } from 'express'
import Education from '../models/education.js'

const router = Router()

router.get('/', async (req, res) => {
  const education = await Education.find().sort({ startDate: -1 })
  res.json({ success: true, data: education })
})

router.post('/', async (req, res) => {
  const { institution, degree, field, startDate, endDate, current } = req.body
  const edu = await Education.create({ institution, degree, field, startDate, endDate, current })
  res.status(201).json({ success: true, data: edu })
})

router.put('/:id', async (req, res) => {
  const { institution, degree, field, startDate, endDate, current } = req.body
  const edu = await Education.findByIdAndUpdate(
    req.params.id,
    { institution, degree, field, startDate, endDate, current },
    { new: true }
  )
  res.json({ success: true, data: edu })
})

router.delete('/:id', async (req, res) => {
  await Education.findByIdAndDelete(req.params.id)
  res.json({ success: true })
})

export default router