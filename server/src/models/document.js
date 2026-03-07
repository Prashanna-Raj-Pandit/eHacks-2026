import mongoose from 'mongoose'

const DocumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Resume', 'Cover Letter', 'Certificate', 'Portfolio', 'Other'],
    required: true 
  },
  originalname: { type: String },
  filename: { type: String },
  mimetype: { type: String },
  size: { type: Number },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true })

export default mongoose.model('Document', DocumentSchema)