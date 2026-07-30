module.exports = {
  root: true,
  env: { node: true, es2021: true },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  ignorePatterns: ['dist'],
  rules: {
    // Allow a deliberately-discarded destructured value to be named with a leading
    // underscore (e.g. excluding a validated-but-not-persisted field from a Prisma
    // `data` object) instead of every case needing its own eslint-disable comment.
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  },
};
