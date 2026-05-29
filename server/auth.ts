import ZitadelProvider from '@auth/core/providers/zitadel';
import { randomUUID } from 'crypto';
import * as oidc from 'openid-client';
import type { AuthConfig } from '@auth/core/types';
import type { JWT } from '@auth/core/jwt';
import { NuxtAuth } from '@zitadel/nuxt-auth/server';
import { ZITADEL_SCOPES } from './scopes';

const cfg = () => useRuntimeConfig();

/**
 * Constructs a secure logout URL for ZITADEL with CSRF protection.
 *
 * This function creates a proper logout URL that terminates the user's session
 * both in your application and in ZITADEL. It includes security measures to
 * prevent Cross-Site Request Forgery (CSRF) attacks during the logout process.
 *
 * ## Security Features
 *
 * - **State Parameter**: Random UUID for CSRF protection
 * - **ID Token Hint**: Tells ZITADEL which session to terminate
 * - **Post-Logout Redirect**: Where to send the user after logout
 *
 * ## Logout Flow
 *
 * 1. User clicks "logout" in your app
 * 2. Your app calls this function to get the logout URL
 * 3. User is redirected to ZITADEL's logout endpoint
 * 4. ZITADEL terminates the session and redirects back to your app
 * 5. Your app validates the state parameter for security
 *
 * @param idToken - The user's ID token from their current session (used to
 * identify which session to terminate)
 * @returns Promise containing the logout URL to redirect to and state value
 * for validation
 */
export async function buildLogoutUrl(
  idToken: string,
): Promise<{ url: string; state: string }> {
  const config = cfg();

  const discovery = await oidc.discovery(
    new URL(config.zitadelDomain),
    config.zitadelClientId,
    config.zitadelClientSecret,
  );

  const state = randomUUID();

  const urlObj = oidc.buildEndSessionUrl(discovery, {
    id_token_hint: idToken,
    post_logout_redirect_uri: config.zitadelPostLogoutUrl,
    state,
  });

  return { url: urlObj.toString(), state };
}

/**
 * Automatically refreshes an expired access token using the refresh token.
 *
 * When a user's access token expires (typically after 1 hour), this function
 * seamlessly exchanges the refresh token for a new access token, allowing the
 * user to continue using the application without having to log in again.
 *
 * This is essential for maintaining long-lived sessions and preventing users
 * from being unexpectedly logged out during active use of the application.
 *
 * ## How Token Refresh Works
 *
 * 1. **Token Expiry Detection**: Auth.js automatically checks if the access
 *    token has expired
 * 2. **Refresh Request**: Uses the refresh token to request new tokens from
 *    ZITADEL
 * 3. **Token Update**: Updates the JWT with the new access token and expiry
 *    time
 * 4. **Seamless Experience**: User continues without interruption
 *
 * ## Error Handling
 *
 * If the refresh fails (e.g., refresh token expired, user permissions
 * revoked), the function sets an error flag that forces the user to sign in
 * again.
 *
 * @param token - The current JWT containing the refresh token and other
 * session data
 * @returns Promise resolving to updated JWT with new tokens or error state
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  const config = cfg();

  if (!token.refreshToken) {
    console.error('No refresh token available for refresh');

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }

  try {
    const discovery = await oidc.discovery(
      new URL(config.zitadelDomain),
      config.zitadelClientId,
      config.zitadelClientSecret,
    );

    const tokenEndpointResponse = await oidc.refreshTokenGrant(
      discovery,
      token.refreshToken as string,
    );

    return {
      ...token,
      accessToken: tokenEndpointResponse.access_token,
      expiresAt: tokenEndpointResponse.expires_in
        ? Date.now() + tokenEndpointResponse.expires_in * 1000
        : Date.now() + 3600 * 1000,
      refreshToken: tokenEndpointResponse.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch (error) {
    console.error('Token refresh failed:', error);

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

/**
 * Auth.js configuration for ZITADEL authentication with token refresh.
 *
 * This configuration implements the industry-standard OAuth 2.0 Authorization
 * Code Flow with PKCE (Proof Key for Code Exchange) for maximum security. It
 * includes automatic token refresh to maintain long-lived user sessions.
 *
 * ## OAuth Scopes
 *
 * Scopes are defined in `scopes.ts` as a simple array. To add/remove scopes,
 * just comment/uncomment lines in that file.
 *
 * ## Session Strategy: JWT vs Database
 *
 * This configuration uses JWT strategy because:
 * - **Stateless**: No database required for session storage
 * - **Scalable**: Works across multiple server instances
 * - **Fast**: No database queries for each request
 * - **Secure**: Tokens are encrypted and signed
 *
 * ## Token Lifecycle
 *
 * 1. **Initial Login**: User authenticates, receives access/refresh/ID tokens
 * 2. **Active Use**: Access token used for API calls (valid ~1 hour)
 * 3. **Token Expiry**: Access token expires, refresh token automatically gets
 *    a new one
 * 4. **Long-term**: Process repeats until the refresh token expires or the
 *    user logs out
 *
 * ## Callback Functions Explained
 *
 * Auth.js uses callback functions to customize the authentication flow:
 * - **redirect**: Controls where users go after login/logout
 * - **jwt**: Manages token storage and refresh logic
 * - **session**: Shapes what data is available to your app
 */
export const authOptions: AuthConfig = {
  providers: [
    ZitadelProvider({
      issuer: cfg().zitadelDomain,
      clientId: cfg().zitadelClientId,
      clientSecret: cfg().zitadelClientSecret,
      authorization: {
        params: {
          scope: ZITADEL_SCOPES,
        },
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: Number(cfg().sessionDuration) || 3600,
  },

  secret: cfg().sessionSecret,

  /**
   * Custom page configurations for Auth.js
   *
   * Auth.js provides several built-in pages for authentication flows, but
   * you can customize them to match your application's design and branding.
   * This configuration overrides the default pages with custom implementations.
   *
   * @see https://authjs.dev/guides/pages/built-in-pages
   *
   * For this PKCE demo, we only customize the most commonly used pages
   * (sign-in and error) since we use external OAuth authentication.
   */
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },

  callbacks: {
    /**
     * Controls where users are redirected after successful authentication.
     *
     * This callback runs after a user successfully signs in and determines
     * their destination. By default, Auth.js would redirect to the page they
     * came from, but this override ensures all users go to the profile page.
     *
     * @param baseUrl - Your application's base URL (e.g.,
     * https://yourdomain.com)
     * @returns The URL to redirect the user to after successful login
     */
    async redirect({ baseUrl }) {
      const postLoginUrl = cfg().zitadelPostLoginUrl || '/profile';
      return postLoginUrl.startsWith('http')
        ? postLoginUrl
        : `${baseUrl}${postLoginUrl}`;
    },

    /**
     * Manages JWT token lifecycle including storage and automatic refresh.
     *
     * This callback runs every time a JWT is accessed and handles:
     * 1. **Initial Login**: Stores tokens from the authentication provider
     * 2. **Token Expiry Check**: Determines if access token needs refreshing
     * 3. **Automatic Refresh**: Calls refresh function when token expires
     *
     * ## When This Runs
     * - Every time getSession() is called
     * - Every time useAuth() updates
     * - Before each authenticated API request
     *
     * ## Token Storage Strategy
     * - ID Token: Used for logout and user identification
     * - Access Token: Used for API calls to ZITADEL
     * - Refresh Token: Used to get new access tokens
     * - Expiry Time: Used to determine when refresh is needed
     *
     * @param token - Current JWT token object
     * @param account - Authentication provider data (only present on initial
     * login)
     * @param user - User object (only present on initial login)
     * @returns Updated JWT token with fresh tokens or error state
     */
    async jwt({ token, account, user }) {
      if (account && user) {
        return {
          ...token,
          idToken: account.id_token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + 3600 * 1000,
          error: undefined,
        };
      }

      if (Date.now() < (token.expiresAt as number)) {
        return token;
      }

      return refreshAccessToken(token);
    },

    /**
     * Shapes the session object that your application receives.
     *
     * This callback transforms the internal JWT token into the session object
     * that your application code can access via useAuth() or
     * getSession().
     *
     * ## Security Note
     *
     * Only include data in the session that your frontend needs. Sensitive
     * tokens like refresh tokens should NOT be exposed to the client.
     *
     * ## Available Data
     * - **idToken**: For logout functionality
     * - **accessToken**: For API calls (if needed on the client-side)
     * - **error**: To handle token refresh failures
     *
     * @param session - The base session object from Auth.js
     * @param token - The JWT token containing all stored data
     * @returns The session object that your application will receive
     */
    async session({ session, token }) {
      session.idToken = token.idToken;
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
};

// noinspection JSUnusedGlobalSymbols
export const { handlers, getSession } = NuxtAuth(authOptions);
