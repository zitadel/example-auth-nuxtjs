module.exports = {
  ignore: ['commitlint.config.js'],
  nuxt: {
    entry: [
      'nuxt.config.ts',
      'app/app.vue',
      'app/app.config.ts',
      'app/error.vue',
      'app/**/*.vue',
      'app/composables/**/*.{js,ts}',
      'app/plugins/**/*.{js,ts}',
      'app/middleware/**/*.{js,ts}',
      'app/utils/**/*.{js,ts}',
      'server/**/*.{js,ts}',
      'content/**/*.{md,yml,yaml,json}',
      'modules/**/*.{js,ts}',
      'app/assets/css/**/*.css',
    ],
  },
  paths: {
    '#auth': ['./server/auth.ts'],
    '#imports': [' .nuxt/imports.d.ts'],
    '~~/server/*': ['./server/*'],
    '~/*': ['./app/*'],
  },
  ignoreDependencies: ['@commitlint/config-conventional'],
  ignoreUnresolved: ['#imports', '#app'],
};
