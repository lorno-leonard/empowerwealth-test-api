module.exports = {
  roots: ['./'],
  moduleNameMapper: {
    '^@config(.*)$': '<rootDir>/src/config$1',
    '^@constants(.*)$': '<rootDir>/src/constants$1',
    '^@handlers(.*)$': '<rootDir>/src/handlers$1',
    '^@libs(.*)$': '<rootDir>/src/libs$1',
    '^@models(.*)$': '<rootDir>/src/models$1',
    '^@services(.*)$': '<rootDir>/src/services$1',
  },
  preset: '@shelf/jest-mongodb',
}
