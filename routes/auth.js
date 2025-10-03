import express from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import User from '../models/User.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Middleware to redirect authenticated users
function ensureGuest(req, res, next) {
  if (!req.user) return next();
  res.redirect('/notes');
}

router.get('/register', ensureGuest, (req, res) => {
  res.render('auth/register', { title: 'Register', errors: [] , form: {} });
});

router.post('/register',
  
  body('fullName').notEmpty().withMessage('Full name required.'),
  body('email').isEmail().withMessage('Valid email required.'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/\d/).withMessage('Password must contain at least one number.')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character.'),
  body('confirmpassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match.'),

  async (req, res) => {
    const errors = validationResult(req);
    const form = req.body;

    if (!errors.isEmpty()) {
      return res.status(422).render('auth/register', { title: 'Register', errors: errors.array(), form });
    }

    try {
      const existing = await User.findOne({ email: req.body.email.toLowerCase() });
      if (existing) {
        return res.status(422).render('auth/register', { title: 'Register', errors: [{ msg: 'Email already used.' }], form });
      }

      const hash = await bcrypt.hash(req.body.password, 10);
      await User.create({
        fullName: req.body.fullName,
        email: req.body.email.toLowerCase(),
        password: hash
      });

      req.session.toast = { message: 'Registration successful. You can log in now.', type: 'success' };
      res.redirect('/login');
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

router.get('/login', ensureGuest, (req, res) => {
  res.render('auth/login', { title: 'Login', errors: [] });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', function(err, user, info) {
    if (err) return next(err);
    if (!user) {
      req.session.toast = { message: info?.message || 'Login failed', type: 'error' };
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      req.session.toast = { message: 'Welcome back!', type: 'success' };
      return res.redirect('/');
    });
  })(req, res, next);
});

// Google auth
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  req.session.toast = { message: 'Logged in with Google', type: 'success' };
  res.redirect('/');
});

// GitHub auth
router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
  req.session.toast = { message: 'Logged in with GitHub', type: 'success' };
  res.redirect('/');
});

// Logout
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) return next(err);
    req.session.toast = { message: 'Logged out', type: 'info' };
    res.redirect('/');
  });
});

export default router;
