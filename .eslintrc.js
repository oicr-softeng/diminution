module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    // 'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier', 'import', 'promise', 'sort-destructure-keys'],
  root: true,
  rules: {
    'arrow-parens': 'off',
    camelcase: 'warn',
    'consistent-return': 'off',
    'comma-dangle': ['warn', 'always-multiline'],
    'generator-star-spacing': 'off',
    'import/no-unresolved': [
      'error',
      {
        caseSensitive: false,
      },
    ],
    'max-len': [
      'warn',
      {
        code: 100,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreUrls: true,
      },
    ],
    'no-console': 'off',
    'no-else-return': [
      'warn',
      {
        allowElseIf: true,
      },
    ],
    'no-multi-assign': 'off',
    'no-nested-ternary': 'off',
    'no-unneeded-ternary': 'warn',
    'no-unused-expressions': [
      'warn',
      {
        allowShortCircuit: true,
      },
    ],
    'no-use-before-define': 'off',
    'prettier/prettier': [
      'warn',
      {
        printWidth: 100,
        singleQuote: true,
        // tabWidth: 4,
        trailingComma: 'all',
      },
    ],
    'promise/param-names': 'error',
    'promise/always-return': 'error',
    'promise/catch-or-return': 'error',
    'promise/no-native': 'off',
  },
};
