/**
 * Match Engine Configuration
 * Maps waste category codes → buyer industry types (Nepal context)
 * Source: MOLE PRD Section 4.3
 *
 * Used by GET /api/matches to find relevant listings for a buyer
 * based on their declared industry.
 */

const MATCH_CONFIG = {
  wood_biomass: [
    'Biomass energy plants',
    'Paper mills',
    'Particle board factories',
    'Furniture manufacturers',
  ],
  plastic_hdpe: [
    'Eco-brick manufacturers',
    'Plastic recyclers',
    'Construction companies',
    'Packaging manufacturers',
  ],
  metal_ferrous: [
    'Foundries',
    'Rebar manufacturers',
    'Construction companies',
    'Metal fabricators',
  ],
  metal_nonferrous: [
    'Electrical component makers',
    'Plumbing suppliers',
    'Electronics recyclers',
    'Copper wire manufacturers',
  ],
  textile_wool: [
    'Insulation manufacturers',
    'Recycled yarn producers',
    'Carpet manufacturers',
    'Upholstery suppliers',
  ],
  concrete_rubble: [
    'Road contractors',
    'Aggregate suppliers',
    'Landfill alternatives',
    'Construction companies',
  ],
  brick_dust: [
    'Cement factories (pozzolan blending)',
    'Pottery studios',
    'Construction companies',
    'Ceramic manufacturers',
  ],
  paper_cardboard: [
    'Paper recycling mills',
    'Packaging manufacturers',
    'Cardboard box makers',
    'Stationery companies',
  ],
  glass_cullet: [
    'Bottle recyclers',
    'Construction aggregate suppliers',
    'Glass manufacturers',
    'Glassware producers',
  ],
  organic_food: [
    'Composting companies',
    'Biogas plants',
    'Animal feed producers',
    'Organic fertilizer companies',
  ],
  other: [],
};

/**
 * Given a buyer's declared industry string, return all category codes
 * that match (case-insensitive partial match).
 *
 * @param {string} buyerIndustry - e.g. "Biomass energy plants"
 * @returns {string[]} array of matching category codes
 */
function getMatchingCategories(buyerIndustry) {
  if (!buyerIndustry) return [];
  const industryLower = buyerIndustry.toLowerCase();

  return Object.entries(MATCH_CONFIG)
    .filter(([, industries]) =>
      industries.some((ind) => ind.toLowerCase().includes(industryLower) || industryLower.includes(ind.toLowerCase()))
    )
    .map(([category]) => category);
}

/**
 * Return the flat list of buyer industries for a given category.
 *
 * @param {string} categoryCode
 * @returns {string[]}
 */
function getBuyerIndustries(categoryCode) {
  return MATCH_CONFIG[categoryCode] || [];
}

module.exports = { MATCH_CONFIG, getMatchingCategories, getBuyerIndustries };
