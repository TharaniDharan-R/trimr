import UAParser from 'ua-parser-js';
import Url from '../models/Url.js';
import Analytics from '../models/Analytics.js';

export const handleRedirect = async (req, res, next) => {
  const { shortCode } = req.params;

  // Skip API paths, favicons, static files, or routes with file extensions
  if (
    shortCode === 'api' ||
    req.originalUrl.startsWith('/api') ||
    shortCode.includes('.') ||
    shortCode === 'favicon.ico'
  ) {
    return next();
  }

  try {
    // Look up by short code or custom alias
    const url = await Url.findOne({
      $or: [{ shortCode }, { customAlias: shortCode }],
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (!url) {
      return next();
    }

    // Expiry check
    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      if (url.status !== 'Expired') {
        url.status = 'Expired';
        await url.save();
      }
      return res.redirect(`${frontendUrl}/expired`);
    }

    // Interstitial check for Password-Protected URL
    if (url.passwordProtected) {
      return res.redirect(`${frontendUrl}/p/${url.shortCode}`);
    }

    // Log Analytics details
    const uaString = req.headers['user-agent'] || '';
    const parser = new UAParser(uaString);
    const result = parser.getResult();

    const browser = result.browser.name || 'Unknown';
    const deviceRaw = result.device.type; // mobile, tablet, etc.
    const device = deviceRaw ? deviceRaw.charAt(0).toUpperCase() + deviceRaw.slice(1) : 'Desktop';
    const os = result.os.name || 'Unknown';
    
    // Parse referer
    let referer = req.headers['referer'] || 'Direct';
    if (referer !== 'Direct') {
      try {
        referer = new URL(referer).hostname;
      } catch (err) {
        referer = 'Direct';
      }
    }

    // Extract IP Address
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    if (ip.includes(',')) {
      ip = ip.split(',')[0].trim();
    }

    // Create analytical event log
    await Analytics.create({
      url: url._id,
      ip,
      browser,
      device,
      os,
      referer,
      timestamp: new Date(),
    });

    // Increment counters
    url.clickCount += 1;
    url.visits += 1;
    url.lastVisited = new Date();
    
    // Check if status is Broken; if we record a hit, it might have recovered, but we keep it or sync it
    await url.save();

    // 302 Redirection to target long URL
    res.redirect(url.originalUrl);
  } catch (error) {
    console.error('Redirection error:', error.message);
    res.status(500).send('Internal Server Error');
  }
};
