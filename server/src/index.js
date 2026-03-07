import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import messageRoutes from './routes/message.js'
import uploadRoutes from './routes/upload.js'
import cvRoutes from './routes/cv.js'
import path from 'path'
import userRoutes from './routes/user.js'
import { fileURLToPath } from 'url'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()

app.use(cors())
app.use(express.json())

app.use('/public', express.static(path.join(__dirname, '../public')))

app.use('/api/cv', cvRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/user', userRoutes)

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err))

app.listen(process.env.PORT || 3001, () =>
  console.log(`Server running on http://localhost:${process.env.PORT || 3001}`)
)