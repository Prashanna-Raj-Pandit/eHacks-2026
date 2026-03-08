import { Router } from 'express'
import UploadMiddleware from '../middlewares/upload.js'
import document from '../models/document.js'
import asyncHandler from '../utils/async.js'

const router = Router()

router.get('/', asyncHandler(async (req, res) => {
  const documents = await document.find().sort({ createdAt: -1 })
  res.json({ success: true, data: documents })
}))

router.post('/', UploadMiddleware().array('imageFiles', 5), async (req, res) => {
  const { name, type } = req.body

  const docs = await Promise.all(
    req.files.map(file =>
      document.create({
        name,
        type,
        originalname: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
      })
    )
  )

  res.status(201).json({ success: true, data: docs })
})

router.delete('/:id', async (req, res) => {
  await document.findByIdAndDelete(req.params.id)
  res.json({ success: true })
})

export default router