import express from 'express';
import multer from 'multer';
import {
  createUrl,
  getUrls,
  getUrlById,
  updateUrl,
  deleteUrl,
  verifyPassword,
  getUrlAnalytics,
  bulkCreateUrls,
  getDashboardOverview
} from '../controllers/urlController.js';
import { protect } from '../middleware/authMiddleware.js';

// Setup temporary folder for bulk CSV uploads
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.route('/')
  .post(protect, createUrl)
  .get(protect, getUrls);

router.get('/overview/analytics', protect, getDashboardOverview);
router.post('/bulk', protect, upload.single('file'), bulkCreateUrls);
router.post('/verify-password', verifyPassword);

router.route('/:id')
  .get(protect, getUrlById)
  .put(protect, updateUrl)
  .delete(protect, deleteUrl);

router.get('/:id/analytics', getUrlAnalytics);

export default router;
