const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');

/**
 * GET /api/categories
 * List all waste categories with matching buyer industries.
 * Used to populate filter dropdowns and AI result display.
 * Public endpoint.
 */
router.get('/', categoriesController.getCategories);

/**
 * GET /api/categories/:code
 * Get a single category by code (e.g. "wood_biomass")
 * Public endpoint.
 */
router.get('/:code', categoriesController.getCategoryByCode);

module.exports = router;
