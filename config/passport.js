import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import dotenv from 'dotenv';
dotenv.config();


export default function configurePassport() {
  passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return done(null, false, { message: 'Incorrect email or password' });
      if (!user.password) return done(null, false, { message: 'Use OAuth to login' });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { message: 'Incorrect email or password' });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));


  // Google OAuth
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'GOOGLE_CLIENT_SECRET',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails[0] && profile.emails[0].value;
      let user = null;
      if (profile.id) user = await User.findOne({ $or: [{ googleId: profile.id }, { email: email }] });
      if (user) {
        // attach googleId if missing
        if (!user.googleId) {
          user.googleId = profile.id;
          user.provider = 'google';
          if (!user.profilePhoto && profile.photos && profile.photos[0]) user.profilePhoto = profile.photos[0].value;
          await user.save();
        }
        return done(null, user);
      }
      
      // create new user
      const defaultAvatar = `${process.env.BASE_URL}/images/avatar.jpg`; 
      const fullName = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() || 'User';
      user = new User({
        fullName: fullName,
        email: email || `no-email+${profile.id}@example.com`,
        provider: 'google',
        googleId: profile.id,
        profilePhoto: profile.photos && profile.photos[0] && profile.photos[0].value || defaultAvatar
      });
      await user.save();
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  // GitHub OAuth
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'GITHUB_CLIENT_ID',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'GITHUB_CLIENT_SECRET',
    callbackURL: process.env.GITHUB_CALLBACK_URL || '/auth/github/callback',
    scope: ['user:email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {

      const emailObj = profile.emails?.[0]; // GitHub may return multiple emails
      if (!emailObj) return done(new Error('No email associated with GitHub account'));

      const email = profile.emails && profile.emails[0] && profile.emails[0].value;
      let user = await User.findOne({ $or: [{ githubId: profile.id }, { email: email }] });

      if (user) {
        if (!user.githubId) {
          user.githubId = profile.id;
          user.provider = 'github';
          if (!user.profilePhoto && profile.photos && profile.photos[0]) {
            user.profilePhoto = profile.photos[0].value;
          }
          await user.save();
        }
        return done(null, user);
      }

      // Provide defaults data if missing
      const names = {
        fullName: profile.displayName || profile.username || 'User'
      };
      const defaultAvatar = `${process.env.BASE_URL}/images/avatar.jpg`; 

      user = new User({
        fullName: names.fullName,
        email: email || `no-email+${profile.id}@github.example.com`,
        provider: 'github',
        githubId: profile.id,
        profilePhoto: profile.photos && profile.photos[0] && profile.photos[0].value || defaultAvatar
      });

      await user.save();
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select('-password');
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}
