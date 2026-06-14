import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  url: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  ip: {
    type: String,
    default: '127.0.0.1',
  },
  browser: {
    type: String,
    default: 'Unknown',
  },
  device: {
    type: String,
    default: 'Desktop',
  },
  os: {
    type: String,
    default: 'Unknown',
  },
  referer: {
    type: String,
    default: 'Direct',
  },
});

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;
