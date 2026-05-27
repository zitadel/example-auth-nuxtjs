import tailwindcss from '@tailwindcss/vite';

// noinspection JSUnusedGlobalSymbols
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devServer: {
    port: Number(process.env.PORT) || 3000,
  },
  devtools: {
    enabled: true,
  },
  modules: ['@nuxt/eslint', '@nuxt/image', '@zitadel/nuxt-auth'],
  vite: {
    plugins: [tailwindcss()],
  },
  // Send the same baseline security headers the other 7 examples set in
  // their respective dev configs. Production hardening still belongs at
  // the reverse proxy.
  routeRules: {
    '/**': {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy':
          "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';",
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    },
  },
  app: {
    head: {
      title: 'Zitadel PKCE Demo',
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      bodyAttrs: {
        class: 'bg-gray-50 min-h-screen flex flex-col',
      },
    },
  },
  css: ['~/assets/css/globals.css'],
  auth: {
    baseURL: '/api/auth',
  },
  hooks: {
    // @ts-expect-error nitro:config is a valid Nuxt hook but missing from the type definitions
    'nitro:config'(nitroConfig: Record<string, unknown>) {
      const devStorage = ((nitroConfig.devStorage as Record<
        string,
        unknown
      >) ??= {});
      devStorage['root'] = {
        driver: 'fs-lite',
        readOnly: true,
        base: nitroConfig.rootDir,
      };
    },
  },
  runtimeConfig: {
    sessionSecret: process.env.SESSION_SECRET,
    zitadelDomain: process.env.ZITADEL_DOMAIN,
    zitadelClientId: process.env.ZITADEL_CLIENT_ID,
    zitadelClientSecret: process.env.ZITADEL_CLIENT_SECRET,
    zitadelPostLoginUrl: process.env.ZITADEL_POST_LOGIN_URL,
    zitadelPostLogoutUrl: process.env.ZITADEL_POST_LOGOUT_URL,

    public: {},
  },
});
