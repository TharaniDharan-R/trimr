import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import User from '../models/User.js';
import Url from '../models/Url.js';
import Analytics from '../models/Analytics.js';

dotenv.config();

const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Chrome Mobile', 'Safari Mobile'];
const devices = ['Desktop', 'Mobile', 'Tablet'];
const osList = ['Windows', 'macOS', 'iOS', 'Android', 'Linux'];
const referers = ['Google', 'Twitter/X', 'GitHub', 'Direct', 'LinkedIn', 'ProductHunt', 'HackerNews'];
const ips = ['192.168.1.1', '10.0.0.4', '172.56.21.89', '8.8.8.8', '64.233.160.0', '198.51.100.42'];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trimr');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Url.deleteMany({});
    await Analytics.deleteMany({});
    console.log('Cleared existing database records.');

    // Create demo user
    const demoPassword = 'password123';
    const user = await User.create({
      name: 'John Doe',
      email: 'demo@trimr.com',
      password: demoPassword, // hashed pre-save hook
    });
    console.log(`Demo user created: ${user.email} (Password: ${demoPassword})`);

    // Helper to build QR Code
    const base = 'http://localhost:5000';
    const makeQr = async (code) => {
      return await QRCode.toDataURL(`${base}/${code}`);
    };

    const links = [
      {
        originalUrl: 'https://github.com/facebook/react',
        shortCode: 'react-repo',
        customAlias: 'react-repo',
        title: 'React GitHub Repository',
        description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
        status: 'Active',
      },
      {
        originalUrl: 'https://news.ycombinator.com',
        shortCode: 'hn',
        customAlias: 'hn',
        title: 'Hacker News',
        description: 'Hacker News is a social news website focusing on computer science and entrepreneurship.',
        status: 'Active',
      },
      {
        originalUrl: 'https://tailwindcss.com',
        shortCode: 'tw-css',
        customAlias: 'tw-css',
        title: 'Tailwind CSS - Rapidly build modern websites',
        description: 'A utility-first CSS framework packed with classes like flex, pt-4, text-center and rotate-90.',
        status: 'Active',
      },
      {
        originalUrl: 'https://recharts.org/en-US',
        shortCode: 'recharts',
        customAlias: 'recharts',
        title: 'Recharts - A composable charting library',
        description: 'Redefined chart library built with React and D3.',
        status: 'Active',
      },
      {
        originalUrl: 'https://this-does-not-exist-1234567.com/broken-page',
        shortCode: 'broken-link',
        customAlias: 'broken-link',
        title: 'Unreachable Domain',
        description: 'Simulating a broken target link to demonstrate our health monitoring badge.',
        status: 'Broken',
      },
    ];

    const seededUrls = [];
    for (const link of links) {
      const qrCode = await makeQr(link.shortCode);
      const createdUrl = await Url.create({
        user: user._id,
        ...link,
        qrCode,
      });
      seededUrls.push(createdUrl);
    }
    console.log(`Seeded ${seededUrls.length} URL short links.`);

    // Seed analytics logs for the past 7 days
    console.log('Simulating 150 visitor clicks across past 7 days...');
    const now = new Date();
    
    for (let i = 0; i < 150; i++) {
      // Pick random URL
      const url = randomItem(seededUrls);
      
      // Pick random date within last 7 days
      const daysAgo = Math.floor(Math.random() * 7);
      const hoursAgo = Math.floor(Math.random() * 24);
      const minutesAgo = Math.floor(Math.random() * 60);
      
      const logDate = new Date();
      logDate.setDate(now.getDate() - daysAgo);
      logDate.setHours(now.getHours() - hoursAgo);
      logDate.setMinutes(now.getMinutes() - minutesAgo);

      // Random browser, device, os
      const device = randomItem(devices);
      const browser = randomItem(browsers);
      const os = randomItem(osList);
      const referer = randomItem(referers);
      const ip = randomItem(ips);

      await Analytics.create({
        url: url._id,
        timestamp: logDate,
        ip,
        browser,
        device,
        os,
        referer,
      });

      // Update url stats
      url.clickCount += 1;
      url.visits += 1;
      if (!url.lastVisited || logDate > url.lastVisited) {
        url.lastVisited = logDate;
      }
    }

    // Save final stats
    for (const url of seededUrls) {
      await url.save();
    }

    console.log('Database successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seed();
