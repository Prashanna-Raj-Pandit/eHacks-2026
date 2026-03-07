import mongoose from 'mongoose'

const EducationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  institution: { type: String, required: true },
  degree: { type: String, default: '' },
  field: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  current: { type: Boolean, default: false },
  source: {
    type: String,
    enum: ['manual', 'linkedin', 'resume'],
    default: 'manual'
  },
}, { timestamps: true })

export default mongoose.model('Education', EducationSchema)