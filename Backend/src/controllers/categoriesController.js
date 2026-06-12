const { MATCH_CONFIG, getBuyerIndustries } = require('../config/matchConfig');

// Build the categories array once at startup
const CATEGORIES = Object.entries(MATCH_CONFIG).map(([code, industries]) => ({
  code,
  label: codeTolabel(code),
  buyer_industries: industries,
}));

/**
 * Convert snake_case category code to human-readable label.
 * e.g. "wood_biomass" → "Wood / Biomass"
 */
function codeTolabel(code) {
  const labels = {
    wood_biomass: 'Wood / Biomass',
    plastic_hdpe: 'Plastic (HDPE)',
    metal_ferrous: 'Metal — Ferrous (Iron/Steel)',
    metal_nonferrous: 'Metal — Non-Ferrous (Copper/Aluminium)',
    textile_wool: 'Textile / Wool / Carpet Scraps',
    concrete_rubble: 'Concrete / Construction Rubble',
    brick_dust: 'Brick Dust / Kiln Residue',
    paper_cardboard: 'Paper / Cardboard',
    glass_cullet: 'Glass / Cullet',
    organic_food: 'Organic / Food Waste',
    other: 'Other',
  };
  return labels[code] || code;
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * GET /api/categories
 * Returns all waste categories with their matching buyer industries.
 */
function getCategories(_req, res) {
  res.json({
    categories: CATEGORIES,
    total: CATEGORIES.length,
  });
}

/**
 * GET /api/categories/:code
 * Returns a single category by code.
 */
function getCategoryByCode(req, res) {
  const { code } = req.params;
  const category = CATEGORIES.find((c) => c.code === code);

  if (!category) {
    return res.status(404).json({
      error: `Category "${code}" not found.`,
      valid_codes: CATEGORIES.map((c) => c.code),
    });
  }

  res.json({ category });
}

module.exports = { getCategories, getCategoryByCode };
