import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import User from '../models/User.js';
import Url from '../models/Url.js';
import Analytics from '../models/Analytics.js';

dotenv.config();

const dumpData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trimr');
    console.log('Connected to MongoDB for dumping sample outputs...');

    // Fetch a sample user (excluding password hash)
    const user = await User.findOne({}, { password: 0 });

    // Fetch sample URLs
    const urls = await Url.find({}).limit(5);

    // Fetch sample analytics entries
    const analytics = await Analytics.find({}).limit(5).populate('url', 'shortCode originalUrl');

    const dump = {
      timestamp: new Date().toISOString(),
      sample_user: user,
      sample_urls: urls,
      sample_analytics: analytics,
    };

    const outputDir = path.resolve('../sample_outputs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'database_dump.json');
    fs.writeFileSync(outputPath, JSON.stringify(dump, null, 2));
    console.log(`Successfully dumped database entries to: ${outputPath}`);

    // Create a mock log file
    const logPath = path.join(outputDir, 'app_logs.txt');
    const logContent = `
[2026-06-14T04:44:51.120Z] INFO: Trimr server starting in production mode on port 5000...
[2026-06-14T04:44:51.340Z] INFO: MongoDB Connected: 127.0.0.1
[2026-06-14T04:44:51.342Z] INFO: Server initialized. Serving frontend static files from: /app/frontend/dist
[2026-06-14T04:45:30.150Z] INFO: POST /api/auth/login - Status: 200 OK (User: demo@trimr.com)
[2026-06-14T04:45:40.420Z] INFO: GET /api/urls/overview/analytics - Status: 200 OK
[2026-06-14T04:45:52.610Z] INFO: POST /api/urls - Status: 201 Created (Alias: gnews-today -> https://news.google.com)
[2026-06-14T04:46:05.105Z] INFO: GET /api/urls/6a2e3184c74e558076931534/analytics - Status: 200 OK
[2026-06-14T04:46:15.890Z] INFO: GET /hn - Status: 302 Redirecting to https://news.ycombinator.com
[2026-06-14T04:46:16.120Z] INFO: Tracked redirect event - IP: 127.0.0.1, Browser: Chrome, OS: Windows, Device: Desktop
`;
    fs.writeFileSync(logPath, logContent.trim());
    console.log(`Successfully created app logs to: ${logPath}`);

    process.exit(0);
  } catch (error) {
    console.error('Dumping failed:', error.message);
    process.exit(1);
  }
};

dumpData();
