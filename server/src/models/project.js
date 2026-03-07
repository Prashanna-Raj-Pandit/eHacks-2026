import mongoose from 'mongoose'

const ProjectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  techStack: [{ type: String }],
  liveUrl: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  readme: { type: String, default: '' },
  stars: { type: Number, default: 0 },
  source: {
    type: String,
    enum: ['manual', 'github'],
    default: 'manual'
  },
}, { timestamps: true })

export default mongoose.model('Project', ProjectSchema)