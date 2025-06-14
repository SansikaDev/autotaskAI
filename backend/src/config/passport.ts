import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { User, IUser } from '../models/User';
import { HydratedDocument } from 'mongoose';

dotenv.config();

interface GoogleProfile {
  id: string;
  displayName: string;
  emails?: Array<{ value: string; verified: boolean }>;
  photos?: Array<{ value: string }>;
  name?: {
    familyName?: string;
    givenName?: string;
  };
}

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: '/api/auth/google/callback'
},
async (accessToken, refreshToken, profile: GoogleProfile, done) => {
  try {
    console.log('[Passport] Processing Google profile:', {
      id: profile.id,
      displayName: profile.displayName,
      email: profile.emails?.[0]?.value
    });

    const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
    const profilePicture = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;

    if (!email) {
      console.error('[Passport] No email found in Google profile');
      return done(new Error("No email found in Google profile"), undefined);
    }

    // Try to find user by Google ID first
    let user = await User.findOne({ googleId: profile.id }) as HydratedDocument<IUser> | null;

    if (user) {
      console.log('[Passport] Found existing user with Google ID:', user.email);
      // Update user profile if necessary
      const updates: Partial<IUser> = {};
      
      if (user.email !== email) updates.email = email;
      if (profilePicture && user.profilePicture !== profilePicture) updates.profilePicture = profilePicture;
      if (profile.displayName && user.name !== profile.displayName) updates.name = profile.displayName;
      
      if (Object.keys(updates).length > 0) {
        console.log('[Passport] Updating user profile:', updates);
        Object.assign(user, updates);
        await user.save();
      }
      
      return done(null, user);
    }

    // If no user found with Google ID, check by email
    user = await User.findOne({ email: email }) as HydratedDocument<IUser> | null;
    
    if (user) {
      console.log('[Passport] Found existing user with email, linking Google account:', user.email);
      // Link Google account to existing user
      user.googleId = profile.id;
      if (profilePicture) user.profilePicture = profilePicture;
      await user.save();
      return done(null, user);
    }

    // Create new user if not found
    console.log('[Passport] Creating new user from Google profile:', email);
    
    // Generate a unique username from display name
    let username = profile.displayName.toLowerCase().replace(/[^a-z0-9]/g, '');
    let usernameExists = await User.findOne({ username });
    let counter = 1;
    
    while (usernameExists) {
      username = `${profile.displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}${counter}`;
      usernameExists = await User.findOne({ username });
      counter++;
    }

    const newUser = new User({
      googleId: profile.id,
      username,
      email,
      name: profile.displayName,
      profilePicture,
      firstName: profile.name?.givenName,
      lastName: profile.name?.familyName,
      password: null, // Google authenticated users won't have a local password
      isEmailVerified: true, // Google emails are verified
    }) as HydratedDocument<IUser>;

    await newUser.save();
    console.log('[Passport] Created new user:', newUser.email);
    return done(null, newUser);
  } catch (err) {
    console.error('[Passport] Error in Google strategy:', err);
    return done(err as Error, undefined);
  }
}));

// Serialize and deserialize user for session management
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    console.error('[Passport] Error deserializing user:', err);
    done(err as Error, undefined);
  }
});

export default passport; 