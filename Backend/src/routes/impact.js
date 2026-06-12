const express = require('express');
const router = express.Router();
const impactController = require('../controllers/impactController');

/**
 * GET /api/impact
 * Aggregate platform impact stats — powers the homepage ImpactCounter.
 * Returns: total_kg_listed, total_kg_traded, total_co2_saved_kg,
 *          active_listings_count, total_users_count
 * Public endpoint.
 */
router.get('/', impactController.getImpact);

module.exports = router;
