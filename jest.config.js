/** @type {import('ts-jest').JestConfigWithTsJest} * */
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+.tsx?$': ['ts-jest', {}],
  },
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};
