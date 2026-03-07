import express from 'express'
import cors from 'cors'
import messageRoutes from './routes/message.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/',messageRoutes)
app.use('/api/messages', messageRoutes)

app.listen(3001, () => console.log('Server running on http://localhost:5000'))