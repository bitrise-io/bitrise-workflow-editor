module.exports = {
  rootDir: '.',
  roots: ['./source'],
  testEnvironment: 'allure-jest/node',
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  moduleNameMapper: {
    '\\.(css|less|svg)$': 'identity-obj-proxy',
    '@/(.*)': '<rootDir>/source/javascripts/$1',
  },
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};
