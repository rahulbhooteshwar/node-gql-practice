import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String
  },
  email: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  images: {
    type: Array,
    default: () => {
      return {
        url: 'https://via.placeholder.com/200x200?text=Profile',
        public_id: new Date().getTime()
      }
    }
  },
  about: {
    type: String,
  }
}, { timestamps: true })

export default mongoose.model('User', userSchema)
