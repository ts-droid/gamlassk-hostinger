import { Router } from 'express';
import passport from 'passport';
import { upsertUser } from './db';
import { COOKIE_NAME } from '../shared/const';
import { getSessionCookieOptions } from './_core/cookies';
import { sdk } from './_core/sdk';

export function createGoogleAuthRoutes(): Router {
  const router = Router();

  // Initiate Google OAuth flow
  router.get(
    '/auth/google',
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false,
    })
  );

  // Google OAuth callback
  router.get(
    '/auth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/?error=google_auth_failed' }),
    async (req, res) => {
      try {
        const user = req.user as any;
        
        if (!user || !user.email) {
          return res.redirect('/?error=no_email');
        }

        // Create a unique openId for Google users
        const openId = `google:${user.providerId}`;

        // Upsert user in database
        await upsertUser({
          openId,
          name: user.name,
          email: user.email,
          loginMethod: 'google',
          lastSignedIn: new Date(),
        });

        // Sign session token
        const token = await sdk.createSessionToken(openId, { name: user.name || '' });
        const cookieOptions = getSessionCookieOptions(req);

        res.cookie(COOKIE_NAME, token, cookieOptions);
        res.redirect('/');
      } catch (error) {
        console.error('[Google Auth] Callback error:', error);
        res.redirect('/?error=auth_failed');
      }
    }
  );

  return router;
}
