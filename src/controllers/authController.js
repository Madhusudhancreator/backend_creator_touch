/**
 * authController.js — handlers for auth routes.
 */

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const repo   = require('../repositories/usersRepository');

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 * Creates a new employee account with status = 'pending'.
 */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next({ status: 400, message: 'Name, email and password are required.' });
    }

    const existing = await repo.findByEmail(email);
    if (existing) {
      return next({ status: 409, message: 'An account with that email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await repo.create({ name, email, password_hash });

    res.status(201).json({ message: 'Registration submitted. Awaiting admin approval.' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns a JWT and the user object on success.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next({ status: 400, message: 'Email and password are required.' });
    }

    const user = await repo.findByEmail(email);
    if (!user) {
      return next({ status: 401, message: 'Invalid credentials.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return next({ status: 401, message: 'Invalid credentials.' });
    }

    if (user.status === 'pending') {
      return next({ status: 403, message: 'Your account is pending approval.' });
    }

    if (user.status === 'rejected') {
      return next({ status: 403, message: 'Your account has been rejected.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, status: user.status },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Protected by authenticate middleware.
 * Returns the current user (excluding password_hash).
 */
async function me(req, res, next) {
  try {
    const user = await repo.findById(req.user.id);
    if (!user) {
      return next({ status: 404, message: 'User not found.' });
    }

    const { password_hash, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
