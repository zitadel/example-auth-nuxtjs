import { getServerSession } from '#auth';
import { setCookie } from 'h3';
import { buildLogoutUrl } from '~~/server/auth';

/**
 * Initiates the logout process by redirecting the user to the external Identity
 * Provider's (IdP) logout endpoint. This endpoint validates that the user has an
 * active session with a valid ID token, generates a cryptographically secure state
 * parameter for CSRF protection, and stores it in a secure HTTP-only cookie.
 *
 * The state parameter will be validated upon the user's return from the IdP to
 * ensure the logout callback is legitimate and not a forged request.
 *
 * @param event - The H3 event object containing the incoming HTTP request context,
 * including session information and cookie handling capabilities.
 * @returns A redirect response to either the IdP's logout URL (on success) or the
 * home page (if no valid session exists). The response includes a secure state
 * cookie that will be validated in the logout callback.
 */
export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);

  if (!session?.idToken) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No valid session or ID token found',
    });
  } else {
    const { url, state } = await buildLogoutUrl(session.idToken);

    setCookie(event, 'logout_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth/logout/callback',
    });

    return sendRedirect(event, url);
  }
});
