/**
 * Route middleware that gates pages behind authentication.
 *
 * Runs server-side during SSR (and client-side on subsequent
 * navigations). When the session is unauthenticated, redirects to the
 * sign-in endpoint with `callbackUrl` set so the user lands back on
 * the requested page after signing in.
 *
 * Apply per-page with `definePageMeta({ middleware: 'auth' })`.
 */
export default defineNuxtRouteMiddleware((to) => {
  const { status } = useAuth();
  if (status.value === 'unauthenticated') {
    return navigateTo(signInUrl({ redirectTo: to.path }), {
      external: true,
    });
  }
});
