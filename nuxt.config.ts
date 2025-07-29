// noinspection JSUnusedGlobalSymbols
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: {
    enabled: true,
  },
  modules: ['@nuxt/eslint', '@nuxtjs/tailwindcss', '@nuxt/image'],
  app: {
    head: {
      bodyAttrs: {
        class: 'bg-gray-50 min-h-screen flex flex-col',
      },
    },
  },
  css: ['~/assets/css/globals.css'],
});
