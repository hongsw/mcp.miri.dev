export default {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    'bin/**/*.js',
    '!src/index.js', // MCP 서버 진입점 제외
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  verbose: true,
  testTimeout: 30000
}; 