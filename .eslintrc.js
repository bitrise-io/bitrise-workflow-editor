module.exports = {
  root: true,
  parserOptions: {
    project: ['tsconfig.json', 'tsconfig.eslint.json'],
    tsconfigRootDir: __dirname,
  },
  env: {
    node: true,
    browser: true,
    jasmine: true,
  },
  globals: {
    _: false,
    cy: false,
    inject: false,
    angular: false,
    Cypress: false,
    Promise: false,
  },
  extends: ['plugin:@bitrise/config'],
  plugins: ['jasmine', 'lodash'],
  rules: {
    /** * Import related rules ** */
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.stories.tsx',
          '**/*.spec.{ts,tsx}',
          '**/*.mocks.ts',
          '**/*.mswMocks.ts',
          '**/*.utils.ts',
          '**/*.factory.ts',
          '*rc.js',
          '*.config.{js,ts}',
        ],
      },
    ],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'jsx-a11y/anchor-is-valid': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/ban-types': ['warn', { types: { '{}': false }, extendDefaults: true }],
    'react/no-unescaped-entities': ['error', { forbid: ['>', '"', '}'] }],
    'testing-library/await-async-queries': 'off',
    'no-restricted-globals': [
      'error',
      {
        name: 'TEST_BITRISE_YML',
        message: 'Do not use TEST_BITRISE_YML outside of storybook, spec or mock files.',
      },
    ],
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
    {
      files: ['*.stories.*'],
      rules: {
        'react-hooks/rules-of-hooks': 'warn',
      },
    },
    {
      files: ['*.spec.{ts,tsx}'],
      rules: {
        'testing-library/await-async-queries': 'error',
      },
    },
    {
      files: ['*.spec.{ts,tsx}', '*.stories.tsx', '*.mocks.ts', '*.mswMocks.ts'],
      rules: {
        'no-restricted-globals': 'off',
      },
    },
    {
      files: ['*.spec.{ts,tsx}', '*.stories.tsx', '*.mocks.ts', '*.mswMocks.ts', '*.factory.ts', '*.utils.ts'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
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
