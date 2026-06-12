const express = require('express');
const router = express.Router();
const matchesController = require('../controllers/matchesController');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/matches
 * Get AI-matched listings for the authenticated buyer's industry profile.
 * Returns listings whose category matches the buyer's declared industry.
 * Auth required — buyer role recommended but not enforced.
 */
router.get('/', requireAuth, matchesController.getMatches);

/**
 * POST /api/matches
 * Create a match record (buyer expresses interest in a listing)
 * Body: { listing_id }
 */
router.post('/', requireAuth, matchesController.createMatch);

/**
 * PUT /api/matches/:id
 * Update match status: pending → contacted → closed
 * Body: { status }
 */
router.put('/:id', requireAuth, matchesController.updateMatchStatus);
router.get('/proposals', requireAuth, matchesController.getProposals);

module.exports = router;
