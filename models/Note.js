import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    default: '' 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  isPinned: { 
    type: Boolean, 
    default: false 
  },
  isFavorite: { 
    type: Boolean,
    default: false 
  }
}, { timestamps: true });

export default mongoose.model('Note', noteSchema);
