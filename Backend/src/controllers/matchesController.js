const Joi = require('joi');
const { supabase } = require('../config/supabase');
const { getMatchingCategories } = require('../config/matchConfig');

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * GET /api/matches
 * Returns active listings that match the authenticated buyer's industry profile.
 * Uses rule-based matching from matchConfig.js (no ML needed for MVP).
 */
async function getMatches(req, res) {
  const buyerIndustry = req.user.industry;

  if (!buyerIndustry) {
    return res.status(400).json({
      error: 'No industry set on your profile. Please update your profile with your industry type.',
      hint: 'PUT /api/auth/me with { "industry": "Biomass energy plants" }',
    });
  }

  // Get matching category codes for this buyer's industry
  const matchingCategories = getMatchingCategories(buyerIndustry);

  if (matchingCategories.length === 0) {
    return res.json({
      matches: [],
      message: `No categories matched for industry: "${buyerIndustry}". Try a broader term.`,
      buyer_industry: buyerIndustry,
    });
  }

  // Fetch active listings in matching categories
  const { data: listings, error } = await supabase
    .from('listings')
    .select(
      `id, title, category_code, material_type, quantity_kg, condition,
       price_npr_min, price_npr_max, photo_url, lat, lng, neighborhood,
       status, created_at, ai_result,
       users:user_id ( full_name, phone, location )`
    )
    .eq('status', 'active')
    .in('category_code', matchingCategories)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getMatches] Supabase error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch matches.' });
  }

  res.json({
    matches: listings,
    matched_categories: matchingCategories,
    buyer_industry: buyerIndustry,
    count: listings.length,
  });
}

/**
 * POST /api/matches
 * Creates a match record when a buyer expresses interest in a listing.
 * Body: { listing_id }
 */
async function createMatch(req, res) {
  const schema = Joi.object({
    listing_id: Joi.string().uuid().required(),
  });

  const { error: validationError, value } = schema.validate(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError.details[0].message });
  }

  // Check listing exists
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id, user_id, status')
    .eq('id', value.listing_id)
    .single();

  if (listingError || !listing) {
    return res.status(404).json({ error: 'Listing not found.' });
  }

  if (listing.status !== 'active') {
    return res.status(400).json({ error: 'This listing is no longer active.' });
  }

  if (listing.user_id === req.user.id) {
    return res.status(400).json({ error: 'You cannot match with your own listing.' });
  }

  // Check for existing match
  const { data: existingMatch } = await supabase
    .from('matches')
    .select('id')
    .eq('listing_id', value.listing_id)
    .eq('buyer_id', req.user.id)
    .single();

  if (existingMatch) {
    return res.status(409).json({ error: 'You have already expressed interest in this listing.' });
  }

  const { data: match, error: insertError } = await supabase
    .from('matches')
    .insert({
      listing_id: value.listing_id,
      buyer_id: req.user.id,
      status: 'pending',
    })
    .select()
    .single();

  if (insertError) {
    console.error('[createMatch] Supabase error:', insertError.message);
    return res.status(500).json({ error: 'Failed to create match.' });
  }

  res.status(201).json({
    message: 'Interest registered. The seller will be notified.',
    match,
  });
}

/**
 * PUT /api/matches/:id
 * Updates match status (pending → contacted → closed).
 * Accessible by listing owner or buyer.
 */
async function updateMatchStatus(req, res) {
  const { id } = req.params;

  const schema = Joi.object({
    status: Joi.string().valid('pending', 'contacted', 'closed').required(),
  });

  const { error: validationError, value } = schema.validate(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError.details[0].message });
  }

  // Fetch match and verify access
  const { data: match, error: fetchError } = await supabase
    .from('matches')
    .select(`id, buyer_id, status, listings:listing_id ( user_id )`)
    .eq('id', id)
    .single();

  if (fetchError || !match) {
    return res.status(404).json({ error: 'Match not found.' });
  }

  const isListingOwner = match.listings?.user_id === req.user.id;
  const isBuyer = match.buyer_id === req.user.id;

  if (!isListingOwner && !isBuyer) {
    return res.status(403).json({ error: 'You do not have access to this match.' });
  }

  // If closed, log to impact_log
  if (value.status === 'closed' && match.status !== 'closed') {
    const { data: listing } = await supabase
      .from('listings')
      .select('quantity_kg')
      .eq('id', match.listing_id)
      .single();

    if (listing) {
      await supabase.from('impact_log').insert({
        listing_id: match.listing_id,
        kg_diverted: listing.quantity_kg,
        co2_saved_kg: listing.quantity_kg * 0.5,
      });

      // Mark listing as sold
      await supabase
        .from('listings')
        .update({ status: 'sold' })
        .eq('id', match.listing_id);
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from('matches')
    .update({ status: value.status })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return res.status(500).json({ error: 'Failed to update match status.' });
  }

  res.json({ message: 'Match status updated.', match: updated });
}

module.exports = { getMatches, createMatch, updateMatchStatus };
