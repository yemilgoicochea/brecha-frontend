export default {
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      { tsconfig: '<rootDir>/tsconfig.spec.json', useESM: true }
    ]
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  extensionsToTreatAsEsm: ['.ts'],
  testMatch: ['**/src/**/*.spec.ts'],
  transformIgnorePatterns: ['node_modules/(?!(?:@angular|rxjs)/)'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text','html','lcov'],
  coverageThreshold: {
    global: { statements: 70, branches: 50, functions: 65, lines: 70 }
  }
  ,testPathIgnorePatterns: ['<rootDir>/src/app/app.component.spec.ts']
};