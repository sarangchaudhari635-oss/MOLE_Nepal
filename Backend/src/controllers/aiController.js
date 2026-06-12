const path = require('path');
const { model, CLASSIFY_SYSTEM_PROMPT } = require('../config/gemini');
const fallbacks = require('../lib/ai-fallbacks.json');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Converts an image Buffer to a Gemini-compatible inlinePart object.
 * @param {Buffer} buffer - Raw image bytes
 * @param {string} mimeType - e.g. "image/jpeg"
 */
function bufferToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType,
    },
  };
}

/**
 * Attempts to extract valid JSON from a Gemini response string.
 * Gemini sometimes wraps JSON in markdown code fences.
 */
function extractJson(text) {
  // Strip markdown code fences if present
  const stripped = text
    .replace(/^```(?:json)?\n?/m, '')
    .replace(/\n?```$/m, '')
    .trim();

  return JSON.parse(stripped);
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/ai/classify
 * Accepts: multipart/form-data with field "image"
 * Returns: Gemini classification result or fallback JSON
 */
async function classifyWaste(req, res) {
  // If no image provided, use fallback immediately
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided. Use field name "image".' });
  }

  // If Gemini is not configured, return a demo fallback
  if (!model) {
    console.warn('[AI classify] Gemini not configured — returning demo fallback.');
    const fallback = fallbacks.wood_dust; // default demo fallback
    return res.json({
      result: fallback,
      source: 'fallback',
      message: 'Demo mode: Gemini API key not configured. Showing sample classification.',
    });
  }

  try {
    const imagePart = bufferToGenerativePart(req.file.buffer, req.file.mimetype);

    // Call Gemini Vision API
    const geminiResult = await model.generateContent([
      CLASSIFY_SYSTEM_PROMPT,
      imagePart,
    ]);

    const responseText = geminiResult.response.text();
    const parsed = extractJson(responseText);

    // Validate required fields are present
    const requiredFields = ['material_type', 'category_code', 'estimated_purity_pct', 'condition', 'price_range_npr', 'buyer_industries'];
    const missing = requiredFields.filter((f) => !(f in parsed));

    if (missing.length > 0) {
      throw new Error(`Gemini response missing fields: ${missing.join(', ')}`);
    }

    return res.json({
      result: parsed,
      source: 'gemini',
    });

  } catch (err) {
    console.error('[AI classify] Gemini error:', err.message);

    // Fallback strategy — never crash on stage (PRD §5.4)
    const fallbackKey = guessFallbackKey(req.file.originalname || '');
    const fallback = fallbacks[fallbackKey] || fallbacks.wood_dust;

    return res.json({
      result: fallback,
      source: 'fallback',
      message: 'AI classification temporarily unavailable. Showing pre-computed demo result.',
      error_detail: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
}

/**
 * Guess the best fallback based on file name (for demo stability).
 * @param {string} filename
 * @returns {string} fallback key
 */
function guessFallbackKey(filename) {
  const lower = filename.toLowerCase();
  if (lower.includes('plastic') || lower.includes('hdpe')) return 'plastic_hdpe';
  if (lower.includes('metal') || lower.includes('iron') || lower.includes('shav')) return 'metal_ferrous';
  return 'wood_dust'; // default
}

/**
 * GET /api/ai/fallbacks
 * Returns the available fallback response keys for frontend demo mode.
 */
function getFallbacks(_req, res) {
  res.json({
    fallbacks,
    available_keys: Object.keys(fallbacks),
  });
}

module.exports = { classifyWaste, getFallbacks };
