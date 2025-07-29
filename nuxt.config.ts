// noinspection JSUnusedGlobalSymbols
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: {
    enabled: true,
  },
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    '@mridang/nuxt-auth',
  ],
  app: {
    head: {
      bodyAttrs: {
        class: 'bg-gray-50 min-h-screen flex flex-col',
      },
    },
  },
  css: ['~/assets/css/globals.css'],
  auth: {
    // REMOVE THIS LINE: originEnvKey: 'NEXTAUTH_URL',
    // ADD THIS LINE TO EXPLICITLY SET THE BASE URL FOR AUTH.JS ENDPOINTS
    baseURL: 'http://localhost:3000/api/auth',
  },
  runtimeConfig: {
    sessionSecret: process.env.SESSION_SECRET,
    zitadelDomain: process.env.ZITADEL_DOMAIN,
    zitadelClientId: process.env.ZITADEL_CLIENT_ID,
    zitadelClientSecret: process.env.ZITADEL_CLIENT_SECRET,
    zitadelPostLogoutUrl: process.env.ZITADEL_POST_LOGOUT_URL,

    public: {
      nextAuthUrl: process.env.NEXTAUTH_URL, // Keep this, as it might be used elsewhere
    },
  },
});
