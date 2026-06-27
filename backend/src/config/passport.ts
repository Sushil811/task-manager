import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email found from Google profile'), false);
        }

        let user = await User.findOne({ email });

        if (!user) {
          user = new User({
            name: profile.displayName || email.split('@')[0],
            email,
            avatar: profile.photos?.[0]?.value,
            authProvider: 'google',
            providerId: profile.id,
          });
          await user.save();
        } else if (!user.providerId) {
          user.authProvider = 'google';
          user.providerId = profile.id;
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || 'dummy_client_id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy_client_secret',
      callbackURL: '/api/auth/github/callback',
      scope: ['user:email']
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email found from GitHub profile. Make sure your email is public or grant email permission.'), false);
        }

        let user = await User.findOne({ email });

        if (!user) {
          user = new User({
            name: profile.displayName || profile.username || email.split('@')[0],
            email,
            avatar: profile.photos?.[0]?.value,
            authProvider: 'github',
            providerId: profile.id,
          });
          await user.save();
        } else if (!user.providerId) {
          user.authProvider = 'github';
          user.providerId = profile.id;
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

export default passport;
