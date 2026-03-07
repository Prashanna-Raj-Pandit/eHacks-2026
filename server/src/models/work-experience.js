import mongoose from 'mongoose'

const WorkExperienceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  company: { type: String, required: true },
  role: { type: String, required: true },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  current: { type: Boolean, default: false },
  description: { type: String, default: '' },
  source: {
    type: String,
    enum: ['manual', 'linkedin', 'resume'],
    default: 'manual'
  },
}, { timestamps: true })

export default mongoose.model('WorkExperience', WorkExperienceSchema)