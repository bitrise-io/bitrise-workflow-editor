/** @type {import('ts-jest').JestConfigWithTsJest} * */
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
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};
