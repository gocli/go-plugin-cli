module.exports = {
  verbose: true,
  testRegex: '(/__tests__/.*(\\.|/)(test|spec))\\.js$',
  collectCoverageFrom: ['src/**/*'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 0
    }
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'd.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  }
}
