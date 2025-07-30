import { type H3Event, setHeader } from 'h3';
import { parseCookies } from 'h3';

/**
 * Handles the callback from an external Identity Provider (IdP) after a user
 * signs out. This endpoint is responsible for validating the logout request to
 * prevent Cross-Site Request Forgery (CSRF) attacks by comparing a `state`
 * parameter from the URL with a value stored in a secure, server-side cookie.
 * If validation is successful, it clears the user's session cookies and
 * redirects to a success page. Otherwise, it redirects to an error page.
 *
 * @param request - The incoming Next.js request object, which contains the
 * URL and its search parameters, including the `state` from the IdP.
 * @returns A NextResponse object that either redirects the user to a success
 * or error page. Upon success, it includes headers to delete session cookies.
 */
export default defineEventHandler(async (event: H3Event) => {
  const cookieStore = parseCookies(event);
  const state = getQuery(event).state as string;
  const logoutStateCookie = cookieStore.logout_state;

  if (state && logoutStateCookie && state === logoutStateCookie) {
    setHeader(event, 'Clear-Site-Data', '"cookies"');

    const successUrl = new URL('/logout/success', getRequestURL(event));
    return sendRedirect(event, successUrl.toString());
  } else {
    const errorUrl = new URL('/logout/error', getRequestURL(event));
    errorUrl.searchParams.set('reason', 'Invalid or missing state parameter.');
    return sendRedirect(event, errorUrl.toString());
  }
});
