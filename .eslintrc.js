module.exports = {
  root: true,
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['tsconfig.json', 'tsconfig.eslint.json'],
  },
  env: {
    node: true,
    browser: true,
    jasmine: true,
  },
  globals: {
    _: false,
    $: 'readonly',
    cy: false,
    jQuery: 'readonly',
    inject: false,
    angular: false,
    Promise: false,
  },
  extends: ['plugin:@bitrise/config'],
  plugins: ['jasmine'],
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
    {
      files: ['./tests/*.spec.ts'],
      rules: {
        'testing-library/prefer-screen-queries': 'off',
      },
    },
    {
      files: ['source/javascripts/**/*.js', 'source/javascripts/services/**/*.ts'],
      rules: {
        'func-names': 'off',
        'no-multi-assign': 'off',
        'no-param-reassign': 'off',
        'class-methods-use-this': 'off',
        'react-hooks/rules-of-hooks': 'off',
        '@typescript-eslint/no-this-alias': 'off',
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
