import mongoose from 'mongoose'

const JDSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: '' },
  cv: { type: String, default: null },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true })

export default mongoose.model('JD', JDSchema)