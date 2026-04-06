import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { ENV } from './_core/env';

let googleStrategyConfigured = false;

export function configureGoogleAuth() {
  if (googleStrategyConfigured) return;
  
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL;
  
  if (!clientID || !clientSecret || !callbackURL) {
    console.warn('[Google Auth] Missing configuration. Google Sign-In will be disabled.');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract user info from Google profile
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName;
          const googleId = profile.id;

          if (!email) {
            return done(new Error('No email found in Google profile'));
          }

          // Return user data to be processed by callback handler
          return done(null, {
            provider: 'google',
            providerId: googleId,
            email,
            name,
            loginMethod: 'google',
          });
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );

  googleStrategyConfigured = true;
  console.log('[Google Auth] Strategy configured');
}

export function isGoogleAuthEnabled(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CALLBACK_URL
  );
}
