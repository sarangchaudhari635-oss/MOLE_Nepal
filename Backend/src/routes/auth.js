const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * POST /api/auth/register
 * Create a new account (generator / buyer / agent)
 * Body: { email, password, full_name, role, industry?, phone?, location? }
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Sign in with email + password, returns JWT
 * Body: { email, password }
 */
router.post('/login', authController.login);

/**
 * GET /api/auth/me
 * Get current authenticated user's profile
 * Headers: Authorization: Bearer <token>
 */
router.get('/me', require('../middleware/auth').requireAuth, authController.getMe);
router.post('/demo-token', authController.demoToken);

module.exports = router;
