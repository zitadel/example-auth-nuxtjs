module.exports = {
  nuxt: {
    entry: [
      'nuxt.config.ts',
      'app/app.vue',
      'app/app.config.ts',
      'app/error.vue',
      'tailwind.config.js',
      'app/**/*.vue',
      'app/composables/**/*.{js,ts}',
      'app/plugins/**/*.{js,ts}',
      'app/middleware/**/*.{js,ts}',
      'app/utils/**/*.{js,ts}',
      'server/**/*.{js,ts}',
      'content/**/*.{md,yml,yaml,json}',
      'modules/**/*.{js,ts}',
    ],
  },
  paths: {
    '#auth': ['./server/auth.ts'],
    '#imports': [' .nuxt/imports.d.ts'],
    '~~/server/*': ['./server/*'],
    '~/*': ['./app/*'],
  },
  ignoreDependencies: ['tailwindcss', 'next-auth'],
  ignoreUnresolved: ['#imports', '#app'],
};
