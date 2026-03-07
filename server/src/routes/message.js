import { Router } from 'express'
const router = Router()

let messages = []

router.get('/', (req, res) => {
  res.json({ success: true, data: messages })
})

router.post('/', (req, res) => {
  const { text, author } = req.body
  const msg = { id: Date.now(), text, author }
  messages.push(msg)
  res.status(201).json({ success: true, data: msg })
})

export default router