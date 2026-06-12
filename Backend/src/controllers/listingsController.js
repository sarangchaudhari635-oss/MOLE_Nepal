const Joi = require('joi');
const { supabase } = require('../config/supabase');

// ─── Validation Schemas ───────────────────────────────────────────────────────

const createListingSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  category_code: Joi.string()
    .valid(
      'wood_biomass', 'plastic_hdpe', 'metal_ferrous', 'metal_nonferrous',
      'textile_wool', 'concrete_rubble', 'brick_dust', 'paper_cardboard',
      'glass_cullet', 'organic_food', 'other'
    )
    .required(),
  material_type: Joi.string().min(2).max(100).required(),
  quantity_kg: Joi.number().positive().required(),
  condition: Joi.string().valid('Clean', 'Contaminated', 'Mixed').required(),
  price_npr_min: Joi.number().min(0).optional().allow(null),
  price_npr_max: Joi.number().min(0).optional().allow(null),
  photo_url: Joi.string().uri().optional().allow('', null),
  lat: Joi.number().min(-90).max(90).optional().allow(null),
  lng: Joi.number().min(-180).max(180).optional().allow(null),
  neighborhood: Joi.string().max(100).optional().allow('', null),
  ai_result: Joi.object().optional().allow(null),
});

const updateListingSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  status: Joi.string().valid('active', 'sold', 'expired').optional(),
  quantity_kg: Joi.number().positive().optional(),
  condition: Joi.string().valid('Clean', 'Contaminated', 'Mixed').optional(),
  price_npr_min: Joi.number().min(0).optional().allow(null),
  price_npr_max: Joi.number().min(0).optional().allow(null),
  neighborhood: Joi.string().max(100).optional().allow('', null),
  lat: Joi.number().optional().allow(null),
  lng: Joi.number().optional().allow(null),
});

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * GET /api/listings
 * Returns all active listings with optional filters.
 * Query params: category, neighborhood, page (default 1), limit (default 20)
 */
async function getListings(req, res) {
  const { category, neighborhood, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = supabase
    .from('listings')
    .select(
      `id, title, category_code, material_type, quantity_kg, condition,
       price_npr_min, price_npr_max, photo_url, lat, lng, neighborhood,
       status, created_at,
       users:user_id ( full_name, phone, location )`,
      { count: 'exact' }
    )
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + parseInt(limit) - 1);

  if (category) query = query.eq('category_code', category);
  if (neighborhood) query = query.ilike('neighborhood', `%${neighborhood}%`);

  const { data, error, count } = await query;

  if (error) {
    console.error('[getListings] Supabase error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch listings.' });
  }

  res.json({
    listings: data,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    },
  });
}

/**
 * GET /api/listings/:id
 * Returns a single listing with seller profile.
 */
async function getListingById(req, res) {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('listings')
    .select(
      `*, users:user_id ( id, full_name, phone, location, role )`
    )
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Listing not found.' });
  }

  res.json({ listing: data });
}

/**
 * POST /api/listings
 * Creates a new waste listing for the authenticated user.
 */
async function createListing(req, res) {
  const { error: validationError, value } = createListingSchema.validate(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError.details[0].message });
  }

  const { data, error } = await supabase
    .from('listings')
    .insert({
      ...value,
      user_id: req.user.id,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    console.error('[createListing] Supabase error:', error.message);
    return res.status(500).json({ error: 'Failed to create listing.' });
  }

  res.status(201).json({
    message: 'Listing created successfully.',
    listing: data,
  });
}

/**
 * PUT /api/listings/:id
 * Updates a listing — restricted to the listing owner.
 */
async function updateListing(req, res) {
  const { id } = req.params;

  // Verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from('listings')
    .select('user_id')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    return res.status(404).json({ error: 'Listing not found.' });
  }

  if (existing.user_id !== req.user.id) {
    return res.status(403).json({ error: 'You do not own this listing.' });
  }

  const { error: validationError, value } = updateListingSchema.validate(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError.details[0].message });
  }

  const { data, error } = await supabase
    .from('listings')
    .update(value)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[updateListing] Supabase error:', error.message);
    return res.status(500).json({ error: 'Failed to update listing.' });
  }

  res.json({
    message: 'Listing updated.',
    listing: data,
  });
}

/**
 * DELETE /api/listings/:id
 * Soft-deletes a listing by setting status = 'expired' — restricted to owner.
 */
async function deleteListing(req, res) {
  const { id } = req.params;

  // Verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from('listings')
    .select('user_id')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    return res.status(404).json({ error: 'Listing not found.' });
  }

  if (existing.user_id !== req.user.id) {
    return res.status(403).json({ error: 'You do not own this listing.' });
  }

  const { error } = await supabase
    .from('listings')
    .update({ status: 'expired' })
    .eq('id', id);

  if (error) {
    console.error('[deleteListing] Supabase error:', error.message);
    return res.status(500).json({ error: 'Failed to delete listing.' });
  }

  res.json({ message: 'Listing removed successfully.' });
}

module.exports = { getListings, getListingById, createListing, updateListing, deleteListing };
