import fs from 'fs';
import QRCode from 'qrcode';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import csv from 'csv-parser';
import Url from '../models/Url.js';
import Analytics from '../models/Analytics.js';
import { checkUrlHealth } from '../services/healthMonitor.js';
import { fetchUrlMetadata } from '../services/metadataService.js';

// Random alphanumeric generator for short codes
const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const generateShortCode = (length = 6) => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Validate URL helper
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// @desc    Create a short URL
// @route   POST /api/urls
// @access  Private
export const createUrl = async (req, res) => {
  let { originalUrl, customAlias, expiresAt, passwordProtected, password, isPublicStats } = req.body;

  try {
    if (!originalUrl) {
      return res.status(400).json({ message: 'Original URL is required' });
    }

    // Auto prepend protocol if missing
    if (!/^https?:\/\//i.test(originalUrl)) {
      originalUrl = 'http://' + originalUrl;
    }

    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ message: 'Invalid URL format. Please include protocol (e.g. http:// or https://)' });
    }

    let shortCode = generateShortCode();

    if (customAlias) {
      // Validate alias chars
      const cleanAlias = customAlias.trim().replace(/[^a-zA-Z0-9-_]/g, '');
      if (cleanAlias !== customAlias) {
        return res.status(400).json({ message: 'Custom alias contains invalid characters. Use alphanumeric, dashes, and underscores.' });
      }

      // Check if alias or short code is already taken
      const aliasExists = await Url.findOne({
        $or: [{ shortCode: customAlias }, { customAlias }],
      });
      if (aliasExists) {
        return res.status(400).json({ message: 'Custom alias is already taken' });
      }
      shortCode = customAlias;
    }

    // Check health of destination
    const isHealthy = await checkUrlHealth(originalUrl);
    
    // Fetch smart preview metadata
    const meta = await fetchUrlMetadata(originalUrl);

    // Dynamic short link base
    const base = `${req.protocol}://${req.get('host')}`;
    const shortUrl = `${base}/${shortCode}`;
    
    // Generate QR Code data URI
    const qrCode = await QRCode.toDataURL(shortUrl);

    let hashedPassword = undefined;
    let urlStatus = isHealthy ? 'Active' : 'Broken';

    if (passwordProtected && password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
      urlStatus = 'Password Protected';
    }

    if (expiresAt && new Date(expiresAt) < new Date()) {
      urlStatus = 'Expired';
    }

    const newUrl = await Url.create({
      user: req.user._id,
      originalUrl,
      title: meta.title,
      description: meta.description,
      shortCode,
      customAlias: customAlias ? customAlias : undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      qrCode,
      passwordProtected: !!passwordProtected,
      password: hashedPassword,
      status: urlStatus,
      isPublicStats: isPublicStats !== undefined ? isPublicStats : true,
    });

    res.status(201).json(newUrl);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all URLs for logged in user
// @route   GET /api/urls
// @access  Private
export const getUrls = async (req, res) => {
  try {
    const urls = await Url.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    // Periodically sync status dynamically (e.g. checks expiry on the fly)
    const now = new Date();
    let updated = false;

    for (let url of urls) {
      if (url.expiresAt && url.expiresAt < now && url.status !== 'Expired') {
        url.status = 'Expired';
        await url.save();
        updated = true;
      }
    }

    const finalUrls = updated 
      ? await Url.find({ user: req.user._id }).sort({ createdAt: -1 })
      : urls;

    res.json(finalUrls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single URL
// @route   GET /api/urls/:id
// @access  Private
export const getUrlById = async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }
    if (url.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    res.json(url);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a URL
// @route   PUT /api/urls/:id
// @access  Private
export const updateUrl = async (req, res) => {
  const { originalUrl, expiresAt, passwordProtected, password, isPublicStats } = req.body;

  try {
    const url = await Url.findById(req.params.id);

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    if (url.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to modify this link' });
    }

    if (originalUrl && originalUrl !== url.originalUrl) {
      let formattedUrl = originalUrl;
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'http://' + formattedUrl;
      }
      if (!isValidUrl(formattedUrl)) {
        return res.status(400).json({ message: 'Invalid URL format' });
      }
      url.originalUrl = formattedUrl;

      // Check health and metadata for new URL
      const isHealthy = await checkUrlHealth(formattedUrl);
      const meta = await fetchUrlMetadata(formattedUrl);
      url.title = meta.title;
      url.description = meta.description;
      url.status = isHealthy ? 'Active' : 'Broken';
    }

    if (expiresAt !== undefined) {
      url.expiresAt = expiresAt ? new Date(expiresAt) : null;
      if (url.expiresAt && url.expiresAt < new Date()) {
        url.status = 'Expired';
      } else if (url.status === 'Expired') {
        url.status = 'Active'; // restore if moved to future
      }
    }

    if (passwordProtected !== undefined) {
      url.passwordProtected = !!passwordProtected;
      if (url.passwordProtected && password) {
        const salt = await bcrypt.genSalt(10);
        url.password = await bcrypt.hash(password, salt);
        url.status = 'Password Protected';
      } else if (!url.passwordProtected) {
        url.password = null;
        if (url.status === 'Password Protected') {
          url.status = 'Active';
        }
      }
    }

    if (isPublicStats !== undefined) {
      url.isPublicStats = !!isPublicStats;
    }

    const updatedUrl = await url.save();
    res.json(updatedUrl);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a shortened URL
// @route   DELETE /api/urls/:id
// @access  Private
export const deleteUrl = async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    if (url.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Delete associated analytics records
    await Analytics.deleteMany({ url: url._id });
    
    // Delete URL record
    await Url.deleteOne({ _id: url._id });

    res.json({ message: 'URL and analytics deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify password for a password-protected short URL
// @route   POST /api/urls/verify-password
// @access  Public
export const verifyPassword = async (req, res) => {
  const { shortCode, password } = req.body;

  try {
    if (!shortCode || !password) {
      return res.status(400).json({ message: 'Shortcode and password are required' });
    }

    const url = await Url.findOne({ shortCode });
    if (!url) {
      return res.status(404).json({ message: 'Link not found' });
    }

    if (!url.passwordProtected || !url.password) {
      return res.status(400).json({ message: 'This link is not password protected' });
    }

    const isMatch = await bcrypt.compare(password, url.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Password verified, return destination URL
    res.json({ originalUrl: url.originalUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get detailed analytics for a URL
// @route   GET /api/urls/:id/analytics
// @access  Public (if publicStats=true) or Private (if owner)
export const getUrlAnalytics = async (req, res) => {
  try {
    let url;
    try {
      url = await Url.findById(req.params.id);
    } catch (err) {
      // Cast to ObjectId failed, search by shortCode / customAlias
    }

    if (!url) {
      url = await Url.findOne({
        $or: [{ shortCode: req.params.id }, { customAlias: req.params.id }],
      });
    }

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Authorization check
    let isOwner = false;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_trimr_saas_key_2026_jwt_token_key');
        if (decoded.id === url.user.toString()) {
          isOwner = true;
        }
      } catch (err) {
        // Continue and check if stats are public
      }
    }

    if (!isOwner && !url.isPublicStats) {
      return res.status(401).json({ message: 'Not authorized to view analytics' });
    }

    // Fetch analytical logs
    const analytics = await Analytics.find({ url: url._id }).sort({ timestamp: -1 });

    // Click Trends: aggregate last 7 days
    const trends = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      trends[dateStr] = 0;
    }

    analytics.forEach((log) => {
      const logDate = new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (trends[logDate] !== undefined) {
        trends[logDate]++;
      }
    });

    const clickTrends = Object.keys(trends).map((key) => ({
      date: key,
      clicks: trends[key],
    }));

    // Helper for groupings
    const groupByField = (list, field) => {
      const grouped = {};
      list.forEach((item) => {
        const val = item[field] || 'Unknown';
        grouped[val] = (grouped[val] || 0) + 1;
      });
      return Object.keys(grouped).map((key) => ({
        name: key,
        value: grouped[key],
      }));
    };

    const browserBreakdown = groupByField(analytics, 'browser');
    const deviceBreakdown = groupByField(analytics, 'device');
    const osBreakdown = groupByField(analytics, 'os');
    
    // Referer breakdown
    const refererBreakdown = groupByField(analytics, 'referer');

    res.json({
      urlDetails: {
        id: url._id,
        title: url.title || 'No Title',
        description: url.description || 'No Description',
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        customAlias: url.customAlias,
        clickCount: url.clickCount,
        lastVisited: url.lastVisited,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt,
        status: url.status,
        qrCode: url.qrCode,
        isPublicStats: url.isPublicStats,
      },
      summary: {
        totalClicks: analytics.length,
        lastVisited: analytics[0] ? analytics[0].timestamp : null,
      },
      clickTrends,
      browserBreakdown,
      deviceBreakdown,
      osBreakdown,
      refererBreakdown,
      recentActivity: analytics.slice(0, 15), // top 15 logs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk shorten URLs via CSV file
// @route   POST /api/urls/bulk
// @access  Private
export const bulkCreateUrls = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No CSV file uploaded' });
  }

  const results = [];
  const errors = [];
  const user = req.user._id;

  const stream = fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      // support common headings like originalUrl, url, destination
      const originalUrl = data.originalUrl || data.url || data.destination || data.destinationUrl;
      const customAlias = data.alias || data.customAlias;
      const expiresAt = data.expiry || data.expiresAt;
      results.push({ originalUrl, customAlias, expiresAt });
    })
    .on('error', (err) => {
      res.status(500).json({ message: 'Error parsing CSV file' });
    })
    .on('end', async () => {
      // Clean up file
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Multer file deletion error:', err.message);
      }

      const createdUrls = [];
      const base = `${req.protocol}://${req.get('host')}`;

      for (const item of results) {
        let { originalUrl, customAlias, expiresAt } = item;

        if (!originalUrl) {
          errors.push({ error: 'Missing destination URL', row: item });
          continue;
        }

        originalUrl = originalUrl.trim();
        if (!/^https?:\/\//i.test(originalUrl)) {
          originalUrl = 'http://' + originalUrl;
        }

        if (!isValidUrl(originalUrl)) {
          errors.push({ error: 'Invalid URL format', url: originalUrl });
          continue;
        }

        let shortCode = generateShortCode();

        if (customAlias) {
          const aliasClean = customAlias.trim().replace(/[^a-zA-Z0-9-_]/g, '');
          const aliasExists = await Url.findOne({
            $or: [{ shortCode: aliasClean }, { customAlias: aliasClean }],
          });
          if (aliasExists) {
            errors.push({ error: `Alias '${customAlias}' already taken. Assigned auto code instead.`, url: originalUrl });
          } else {
            shortCode = aliasClean;
          }
        }

        const isHealthy = await checkUrlHealth(originalUrl);
        const meta = await fetchUrlMetadata(originalUrl);
        const shortUrl = `${base}/${shortCode}`;
        const qrCode = await QRCode.toDataURL(shortUrl);

        try {
          const newUrl = await Url.create({
            user,
            originalUrl,
            shortCode,
            customAlias: customAlias && shortCode === customAlias ? customAlias : undefined,
            title: meta.title,
            description: meta.description,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            qrCode,
            status: isHealthy ? 'Active' : 'Broken',
          });
          createdUrls.push(newUrl);
        } catch (err) {
          errors.push({ error: err.message, url: originalUrl });
        }
      }

      res.status(201).json({
        message: `Successfully processed CSV. Created ${createdUrls.length} short links.`,
        created: createdUrls,
        errors,
      });
    });
};

// @desc    Get dashboard overview data (aggregates clicks, counts, trends)
// @route   GET /api/urls/overview/analytics
// @access  Private
export const getDashboardOverview = async (req, res) => {
  try {
    const urls = await Url.find({ user: req.user._id });
    const urlIds = urls.map((u) => u._id);

    const analytics = await Analytics.find({ url: { $in: urlIds } }).sort({ timestamp: -1 });

    // Click Trends: aggregate last 7 days
    const trends = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      trends[dateStr] = 0;
    }

    analytics.forEach((log) => {
      const logDate = new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (trends[logDate] !== undefined) {
        trends[logDate]++;
      }
    });

    const clickTrends = Object.keys(trends).map((key) => ({
      date: key,
      clicks: trends[key],
    }));

    // Grouping helpers
    const groupByField = (list, field) => {
      const grouped = {};
      list.forEach((item) => {
        const val = item[field] || 'Unknown';
        grouped[val] = (grouped[val] || 0) + 1;
      });
      return Object.keys(grouped).map((key) => ({
        name: key,
        value: grouped[key],
      }));
    };

    const browserBreakdown = groupByField(analytics, 'browser');
    const deviceBreakdown = groupByField(analytics, 'device');
    const osBreakdown = groupByField(analytics, 'os');

    res.json({
      summary: {
        totalLinks: urls.length,
        totalClicks: analytics.length,
        activeLinks: urls.filter((u) => u.status === 'Active' || u.status === 'Password Protected').length,
        qrScans: Math.floor(analytics.length * 0.22), // simulate 22% scans
      },
      clickTrends,
      browserBreakdown,
      deviceBreakdown,
      osBreakdown,
      recentActivity: analytics.slice(0, 10), // top 10 logs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

