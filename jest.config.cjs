module.exports = {
  rootDir: '.',
  roots: ['./source'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  moduleNameMapper: {
    '\\.(css|less|svg)$': 'identity-obj-proxy',
    '^@bitrise/bitkit-v2$': '<rootDir>/node_modules/@bitrise/bitkit-v2/dist/main.js',
    // In the jsdom environment the `yaml` package resolves to its untransformed ESM
    // browser build; pin it to the CJS dist used in the node environment.
    '^yaml$': '<rootDir>/node_modules/yaml/dist/index.js',
    // `@bitrise/languageserver-core` is a Vite/tsconfig alias; jest can't resolve it. Point it at the
    // package's REAL codec module (not the barrel index, which pulls the whole LanguageService graph)
    // so tests run the actual `composeBitriseUri` — no hand-maintained stand-in to drift. The
    // transformIgnorePatterns exception below lets @swc/jest compile that raw-TS source.
    '^@bitrise/languageserver-core$':
      '<rootDir>/node_modules/@bitrise/languageserver/packages/core/src/bitriseUri.ts',
    '@/(.*)': '<rootDir>/source/javascripts/$1',
  },
  // node_modules is transform-ignored by default; allow @bitrise/languageserver so the real codec
  // (raw TS shipped by the git dependency) gets compiled.
  transformIgnorePatterns: ['/node_modules/(?!@bitrise/languageserver/)', '\\.pnp\\.[^\\/]+$'],
  setupFiles: ['<rootDir>/spec/set-node-env.ts'],
  setupFilesAfterEnv: ['<rootDir>/spec/setup-jest.ts'],
  moduleDirectories: ['node_modules', '<rootDir>/spec/__mocks__'],
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};
