const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { supabase, supabasePublic } = require('../config/supabase');

// ─── Validation Schemas ───────────────────────────────────────────────────────

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  full_name: Joi.string().min(2).max(100).required(),
  role: Joi.string().valid('generator', 'buyer', 'agent').required(),
  industry: Joi.string().max(100).optional().allow('', null),
  phone: Joi.string().max(20).optional().allow('', null),
  location: Joi.string().max(100).optional().allow('', null),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateToken(userId, role) {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'mole-dev-secret',
    { expiresIn: '7d' }
  );
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Creates a Supabase Auth user + inserts profile row in the users table.
 */
async function register(req, res) {
  const { error: validationError, value } = registerSchema.validate(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError.details[0].message });
  }

  const { email, password, full_name, role, industry, phone, location } = value;

  // Create auth user via Supabase Auth
  const { data: authData, error: authError } = await supabasePublic.auth.signUp({
    email,
    password,
  });

  if (authError) {
    // Handle duplicate email gracefully
    if (authError.message.includes('already registered')) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    return res.status(400).json({ error: authError.message });
  }

  const authUserId = authData.user?.id;
  if (!authUserId) {
    return res.status(500).json({ error: 'Failed to create auth account.' });
  }

  // Insert profile row into our users table
  const { data: userRow, error: insertError } = await supabase
    .from('users')
    .insert({
      id: authUserId,
      email,
      full_name,
      role,
      industry: industry || null,
      phone: phone || null,
      location: location || null,
    })
    .select()
    .single();

  if (insertError) {
    console.error('[register] DB insert error:', insertError.message);
    return res.status(500).json({ error: 'Account created but profile save failed. Contact support.' });
  }

  const token = generateToken(authUserId, role);

  res.status(201).json({
    message: 'Account created successfully.',
    token,
    user: {
      id: userRow.id,
      email: userRow.email,
      full_name: userRow.full_name,
      role: userRow.role,
      industry: userRow.industry,
      location: userRow.location,
    },
  });
}

/**
 * POST /api/auth/login
 * Signs in with email/password via Supabase Auth, returns JWT.
 */
async function login(req, res) {
  const { error: validationError, value } = loginSchema.validate(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError.details[0].message });
  }

  const { email, password } = value;

  // Sign in via Supabase Auth
  const { data: authData, error: authError } = await supabasePublic.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const authUserId = authData.user?.id;

  // Fetch profile from our users table
  const { data: userRow, error: fetchError } = await supabase
    .from('users')
    .select('id, email, full_name, role, industry, phone, location, created_at')
    .eq('id', authUserId)
    .single();

  if (fetchError || !userRow) {
    return res.status(404).json({ error: 'User profile not found.' });
  }

  const token = generateToken(authUserId, userRow.role);

  res.json({
    message: 'Login successful.',
    token,
    user: userRow,
  });
}

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile.
 */
async function getMe(req, res) {
  const { data: userRow, error } = await supabase
    .from('users')
    .select('id, email, full_name, role, industry, phone, location, created_at')
    .eq('id', req.user.userId)
    .single();

  if (error || !userRow) {
    return res.status(404).json({ error: 'User not found.' });
  }

  res.json({ user: userRow });
}

module.exports = { register, login, getMe };
