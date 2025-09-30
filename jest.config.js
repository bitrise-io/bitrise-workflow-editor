module.exports = {
  rootDir: '.',
  roots: ['./source'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  moduleNameMapper: {
    '\\.(css|less|svg)$': 'identity-obj-proxy',
    '@/(.*)': '<rootDir>/source/javascripts/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/spec/setup-jest.ts'],
  moduleDirectories: ['node_modules', '<rootDir>/spec/__mocks__'],
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};
