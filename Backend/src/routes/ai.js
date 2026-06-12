const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { requireAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

/**
 * POST /api/ai/classify
 * Upload a waste photo → Gemini Vision analyzes it → returns classification JSON.
 * Accepts: multipart/form-data with field "image"
 * Falls back to pre-computed responses if Gemini API is unavailable.
 * Auth required.
 */
router.post('/classify', requireAuth, upload.single('image'), aiController.classifyWaste);

/**
 * GET /api/ai/fallbacks
 * Return the list of available fallback demo responses (for frontend demo mode).
 * Public endpoint.
 */
router.get('/fallbacks', aiController.getFallbacks);

module.exports = router;
