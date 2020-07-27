import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: 'Title is Required',
    text: true
  },
  content: {
    type: String,
    required: 'Content is Required',
    text: true
  },
  image: {
    url: {
      type: String,
      default: "https://via.placeholder.com/300x200?text=Post"
    },
    public_id: {
      type: String,
      default: Date.now
    }
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true })
postSchema.index({ title: 'text', 'content': 'text' });
// postSchema.index({'$**': 'text'});

export default mongoose.model('Post', postSchema)