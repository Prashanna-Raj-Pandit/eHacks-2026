import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  bio: { type: String, default: '' },
  location: { type: String, default: '' },

  // auth fields — not used yet but ready
  password: { type: String, default: null },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true })

export default mongoose.model('User', UserSchema)