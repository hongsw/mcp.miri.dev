export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': ['babel-jest', { 
      presets: [['@babel/preset-env', { 
        targets: { node: 'current' },
        modules: 'commonjs'
      }]]
    }]
  },
  collectCoverageFrom: [
    'src/**/*.js',
    'bin/**/*.js',
    '!src/index.js', // MCP 서버 진입점 제외
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  verbose: true,
  testTimeout: 60000
}; 