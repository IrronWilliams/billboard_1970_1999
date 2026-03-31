'use strict';

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  clearMocks: true,
  collectCoverageFrom: [
    'routes/ratings.js',
    'ratingsDb.js',
  ],
  testTimeout: 10000,
};
