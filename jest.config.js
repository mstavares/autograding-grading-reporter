module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./__tests__/setup.js'],
  testTimeout: 30000, // 30 seconds default timeout for all tests
  verbose: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/main.js', // Exclude main entry point
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  testMatch: [
    '**/__tests__/**/*.test.js'
  ],
  // Transform ESM modules to CommonJS for Jest
  transformIgnorePatterns: [
    'node_modules/(?!(google-spreadsheet|ky|@sindresorhus)/)'
  ],
  transform: {
    '^.+\\.js$': 'babel-jest'
  }
};
