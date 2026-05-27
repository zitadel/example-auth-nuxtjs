import { getSession } from '~~/server/auth';

/**
 * ZITADEL UserInfo API Route
 *
 * Fetches extended user information from ZITADEL's UserInfo endpoint.
 * This provides real-time user data including roles, custom attributes,
 * and organization membership that may not be in the cached session.
 *
 * ## Usage
 *
 * ```typescript
 * const response = await fetch('/api/userinfo');
 * const userInfo = await response.json();
 * ```
 *
 * ## Returns
 *
 * Extended user profile with ZITADEL-specific claims like roles and metadata.
 */
export default defineEventHandler(async (event) => {
  const session = await getSession(event);

  if (!session?.accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const config = useRuntimeConfig();
  try {
    const response = await fetch(`${config.zitadelDomain}/oidc/v1/userinfo`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      // noinspection ExceptionCaughtLocallyJS
      throw new Error(`UserInfo API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('UserInfo fetch failed:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch user info',
    });
  }
});
