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
    '@/(.*)': '<rootDir>/source/javascripts/$1',
  },
  setupFiles: ['<rootDir>/spec/set-node-env.ts'],
  setupFilesAfterEnv: ['<rootDir>/spec/setup-jest.ts'],
  moduleDirectories: ['node_modules', '<rootDir>/spec/__mocks__'],
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};
