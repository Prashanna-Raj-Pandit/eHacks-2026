import { Router } from 'express'
import UploadMiddleware from '../middlewares/upload.js'

const router = Router()

let files = []

router.get('/', (req, res) => {
  res.json({ success: true, data: files })
})

// router.post('/', (req, res) => {
//   const { text, author } = req.body
//   const msg = { id: Date.now(), text, author }
//   messages.push(msg)
//   res.status(201).json({ success: true, data: msg })
// })

router
  .route("/")
  .post(UploadMiddleware().array("imageFiles",5), (req, res) => {
  files.push(req.files)
  res.status(201).json({ success: true, data: files })
});

export default router