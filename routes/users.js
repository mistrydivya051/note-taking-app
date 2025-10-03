import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Middleware to ensure user is authenticated
function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.session.toast = { message: 'Please log in', type: 'warn' };
  res.redirect('/login');
}

// List all users
router.get('/', ensureAuth, async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.render('users/list', { title: 'Users', users });
});

export default router;
