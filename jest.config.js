/** @type {import('ts-jest').JestConfigWithTsJest} * */
module.exports = {
  rootDir: '.',
  roots: ['./source'],
  testEnvironment: 'node',
  transform: { '^.+.tsx?$': 'ts-jest' },
  moduleNameMapper: { '@/(.*)': '<rootDir>/source/javascripts/$1' },
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};
