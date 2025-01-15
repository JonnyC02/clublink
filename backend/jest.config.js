module.exports = {
  rootDir: './',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};