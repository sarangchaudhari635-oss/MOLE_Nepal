const { supabase } = require('../config/supabase');

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * GET /api/impact
 * Aggregates platform-wide impact metrics for the homepage ImpactCounter.
 * Returns:
 *   - total_kg_listed     : sum of all active listing quantities
 *   - total_kg_traded     : sum of all impact_log kg_diverted entries
 *   - total_co2_saved_kg  : sum of all impact_log co2_saved_kg entries
 *   - active_listings     : count of listings with status = 'active'
 *   - total_users         : total user count
 */
async function getImpact(req, res) {
  // Run all queries in parallel for speed
  const [
    listingsResult,
    impactResult,
    activeCountResult,
    usersResult,
  ] = await Promise.all([
    // Total kg listed (active listings only)
    supabase
      .from('listings')
      .select('quantity_kg')
      .eq('status', 'active'),

    // Total traded kg + CO₂ saved from impact_log
    supabase
      .from('impact_log')
      .select('kg_diverted, co2_saved_kg'),

    // Count active listings
    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),

    // Count all users
    supabase
      .from('users')
      .select('id', { count: 'exact', head: true }),
  ]);

  // Calculate totals
  const totalKgListed = (listingsResult.data || []).reduce(
    (sum, row) => sum + Number(row.quantity_kg || 0),
    0
  );

  const totalKgTraded = (impactResult.data || []).reduce(
    (sum, row) => sum + Number(row.kg_diverted || 0),
    0
  );

  const totalCo2Saved = (impactResult.data || []).reduce(
    (sum, row) => sum + Number(row.co2_saved_kg || 0),
    0
  );

  res.json({
    total_kg_listed: Math.round(totalKgListed),
    total_kg_traded: Math.round(totalKgTraded),
    total_co2_saved_kg: Math.round(totalCo2Saved * 10) / 10, // 1 decimal place
    active_listings: activeCountResult.count || 0,
    total_users: usersResult.count || 0,
    // Derived display values matching the PRD demo script
    waste_diverted_from_landfill_kg: Math.round(totalKgTraded),
    co2_equivalent_saved_kg: Math.round(totalCo2Saved * 10) / 10,
  });
}

module.exports = { getImpact };
