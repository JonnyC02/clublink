module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: './',
    testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
    moduleDirectories: ['node_modules', '<rootDir>/src'],
  };