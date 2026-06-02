/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './src',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    // Resolve path alias @/* → src/*
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          // Relax for tests — unused vars are common in test doubles
          noUnusedLocals: false,
          noUnusedParameters: false,
          noImplicitReturns: false,
        },
      },
    ],
  },
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
}
