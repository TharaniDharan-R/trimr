import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import urlRoutes from './src/routes/urlRoutes.js';
import { handleRedirect } from './src/controllers/redirectController.js';
import { notFound, errorHandler } from './src/middleware/errorMiddleware.js';

// Load environmental configuration
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Create uploads directory if not present for bulk imports
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Enable cross-origin resource sharing
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Standard JSON request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log basic requests in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// REST API Route Registrations
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);

// Server-Side Redirect Handler (Captures short URLs, e.g. GET /abc123)
app.get('/:shortCode', handleRedirect);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Serve frontend static assets in production
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

// Error handling middleware configurations
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Trimr server running in development mode on port ${PORT}`);
});
