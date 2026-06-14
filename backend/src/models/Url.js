import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  originalUrl: {
    type: String,
    required: [true, 'Original URL is required'],
    trim: true,
  },
  title: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  customAlias: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  clickCount: {
    type: Number,
    default: 0,
  },
  visits: {
    type: Number,
    default: 0,
  },
  lastVisited: {
    type: Date,
  },
  expiresAt: {
    type: Date,
  },
  qrCode: {
    type: String, // Base64 Data URI
  },
  passwordProtected: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String, // Hashed password
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Password Protected', 'Broken'],
    default: 'Active',
  },
  isPublicStats: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Url = mongoose.model('Url', urlSchema);
export default Url;
