import type { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth';
import ZitadelProvider from 'next-auth/providers/zitadel';
import { randomUUID } from 'crypto';
import * as oidc from 'openid-client';
import type { JWT } from 'next-auth/jwt';
import { ZITADEL_SCOPES } from './scopes'; // Import from 'server/scopes.ts'

// --- Helper function for token refresh (as you provided) ---
async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    console.error('No refresh token available for refresh');
    return { ...token, error: 'RefreshAccessTokenError' };
  }
  try {
    const config = await oidc.discovery(
      new URL(process.env.ZITADEL_DOMAIN!),
      process.env.ZITADEL_CLIENT_ID!,
      process.env.ZITADEL_CLIENT_SECRET,
    );
    const tokenEndpointResponse = await oidc.refreshTokenGrant(
      config,
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
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

// --- Helper function for logout URL (as you provided) ---
export async function buildLogoutUrl(
  idToken: string,
): Promise<{ url: string; state: string }> {
  const config = await oidc.discovery(
    new URL(process.env.ZITADEL_DOMAIN!),
    process.env.ZITADEL_CLIENT_ID!,
    process.env.ZITADEL_CLIENT_SECRET,
  );
  const state = randomUUID();
  const urlObj = oidc.buildEndSessionUrl(config, {
    id_token_hint: idToken,
    post_logout_redirect_uri: process.env.ZITADEL_POST_LOGOUT_URL!,
    state,
  });
  return { url: urlObj.toString(), state };
}

// --- NextAuth Module Augmentations (as you provided) ---
declare module 'next-auth' {
  interface Session {
    idToken?: string;
    accessToken?: string;
    error?: string;
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    idToken?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
  }
}

// --- Core Auth.js Configuration Options ---
export const authOptions: NextAuthOptions = {
  // ZITADEL Provider Configuration
  providers: [
    ZitadelProvider.default({
      // These credentials are read directly from process.env, which Nuxt will populate
      // from your .env file or runtimeConfig.
      issuer: process.env.ZITADEL_DOMAIN!,
      clientId: process.env.ZITADEL_CLIENT_ID!,
      clientSecret: process.env.ZITADEL_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: ZITADEL_SCOPES, // Scopes from server/scopes.ts
        },
      },
      // The profile callback helps map ZITADEL's user data to Auth.js's user object.
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || profile.preferred_username,
          email: profile.email,
          image: profile.picture || null,
          locale: profile.locale, // Example of including ZITADEL-specific claims
        };
      },
    }),
  ],

  // Session Management Configuration
  session: {
    strategy: 'jwt',
    // maxAge comes from your SESSION_DURATION environment variable
    maxAge: Number(process.env.SESSION_DURATION) || 3600,
  },

  // Secret for signing/encrypting JWTs and cookies, from SESSION_SECRET env var.
  secret: process.env.SESSION_SECRET,

  // Custom pages for Auth.js flows
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  // Callbacks for controlling authentication flow and session data
  callbacks: {
    // Redirects user after login.
    async redirect({ baseUrl }) {
      return `${baseUrl}/profile`;
    },
    // Manages JWT content and token refresh.
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
      return refreshAccessToken(token); // Call your helper to refresh
    },
    // Shapes the session object available to the client.
    async session({ session, token }) {
      session.idToken = token.idToken;
      session.accessToken = token.accessToken;
      session.error = token.error;
      if (token.zitadelProfile) {
        // Include any custom profile data if you mapped it
        session.user.locale = token.zitadelProfile.locale;
      }
      return session;
    },
  },
};

export default NextAuth.default(authOptions);
