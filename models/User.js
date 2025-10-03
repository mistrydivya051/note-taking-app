import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  password: { 
    type: String 
  },
  provider: { 
    type: String,
     default: 'local' 
    },
  googleId: { 
    type: String 
  },
  githubId: { 
    type: String 
  },
    profilePhoto: { 
    type: String,
    default: `${process.env.BASE_URL}/images/avatar.jpg`
  },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
