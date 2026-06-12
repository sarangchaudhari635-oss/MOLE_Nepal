const express = require('express');
const router = express.Router();
const listingsController = require('../controllers/listingsController');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/listings
 * Fetch all active listings (public)
 * Query params: category, neighborhood, page, limit
 */
router.get('/', listingsController.getListings);

/**
 * GET /api/listings/:id
 * Fetch a single listing with seller profile (public)
 */
router.get('/:id', listingsController.getListingById);

/**
 * POST /api/listings
 * Create a new waste listing (auth required)
 * Body: { title, category_code, material_type, quantity_kg, condition,
 *         price_npr_min?, price_npr_max?, lat?, lng?, neighborhood?,
 *         photo_url?, ai_result? }
 */
router.post('/', requireAuth, listingsController.createListing);

/**
 * PUT /api/listings/:id
 * Update a listing's status or details (owner only)
 * Body: { status?, title?, quantity_kg?, ... }
 */
router.put('/:id', requireAuth, listingsController.updateListing);

/**
 * DELETE /api/listings/:id
 * Soft-delete a listing (owner only)
 */
router.delete('/:id', requireAuth, listingsController.deleteListing);

module.exports = router;
