import js from '@eslint/js';
import ts from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
// `@nuxt/eslint` regenerates `.nuxt/eslint.config.mjs` on every `nuxt prepare`
// (run by the `postinstall` script). The generated file's `configs` named
// export is a flat-config composer containing two things we can't compute
// statically and can't reasonably hand-maintain:
//   1. The set of Nuxt auto-import globals (`useFetch`, `definePageMeta`,
//      `defineEventHandler`, …) — list depends on installed Nuxt modules.
//   2. The Nuxt framework setup (vue plugin, .vue parser, vue rules, nuxt
//      rules) from `@nuxt/eslint-config`.
// We pull those in here and layer them under the same skeleton used by the
// rest of the fleet, instead of using the `withNuxt(...)` default-export
// wrapper that would invert the composition order. Vue setup is delegated
// entirely to the Nuxt-supplied block — adding our own would double-register
// the `vue` plugin.
import { configs as nuxtConfigs } from './.nuxt/eslint.config.mjs';

// `eslint-flat-config-utils` uses `Object.groupBy`, a Node 21+ builtin. The
// repo runs Node 22 (per devbox), but this polyfill keeps the config working
// under older Node versions too.
if (typeof Object.groupBy !== 'function') {
  Object.groupBy = (items, fn) => {
    const out = Object.create(null);
    let i = 0;
    for (const item of items) {
      const key = fn(item, i++);
      (out[key] ??= []).push(item);
    }
    return out;
  };
}

const nuxtBase = await nuxtConfigs.toConfigs();

export default ts.config(
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.nuxt/**',
      '.output/**',
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: ts.parser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
      globals: { ...globals.browser, ...globals.node, ...globals.es2021 },
    },
  },
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.es2021 },
    },
  },
  {
    files: ['**/*.{test,spec}.{ts,tsx,js,mjs}', 'test/**/*.{ts,tsx,js,mjs}'],
    languageOptions: { globals: { ...globals.jest, ...globals.node } },
  },
  // Nuxt framework block: vue plugin + .vue parser + nuxt rules +
  // dynamically-generated auto-import globals. Provided by @nuxt/eslint via
  // the file regenerated on `nuxt prepare`.
  ...nuxtBase,
  {
    rules: {
      // Pre-existing override.
      'vue/html-self-closing': 'off',
    },
  },
  prettier,
);
