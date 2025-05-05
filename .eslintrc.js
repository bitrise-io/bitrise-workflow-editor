/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,

  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['tsconfig.json', 'tsconfig.eslint.json'],
  },
  env: {
    node: true,
    browser: true,
  },
  plugins: ['simple-import-sort'],
  extends: ['plugin:@bitrise/config'],
  rules: {
    'import/order': 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-use-before-define': 'warn',
    'no-restricted-globals': [
      'error',
      {
        name: 'TEST_BITRISE_YML',
        message: 'Do not use TEST_BITRISE_YML outside of storybook, spec or mock files.',
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        name: 'zustand/shallow',
        importNames: ['useShallow'],
        message: `Please import useShallow from '@/core/hooks/useShallow' instead.`,
      },
      {
        name: 'zustand/react/shallow',
        importNames: ['useShallow'],
        message: `Please import useShallow from '@/core/hooks/useShallow' instead.`,
      },
    ],
  },
  overrides: [
    {
      files: ['*.spec.{ts,tsx}', '*.stories.tsx', '*.mocks.ts', '*.mswMocks.ts'],
      rules: {
        'no-restricted-globals': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
  settings: {
    'import/resolver': {
      alias: {
        map: [['@', './source/javascripts']],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
