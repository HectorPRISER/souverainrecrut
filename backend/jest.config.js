/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.test.json" }],
  },
  setupFiles: ["<rootDir>/tests/setup/env.ts"],
  globalSetup: "<rootDir>/tests/setup/global-setup.ts",
  // Les tests d'intégration partagent une même base PostgreSQL : exécution séquentielle.
  maxWorkers: 1,
  testTimeout: 20000,

  collectCoverage: false,
  collectCoverageFrom: [
    "src/**/*.ts",
    // Bootstrap (listen) et définitions OpenAPI : pas de logique testable.
    "!src/server.ts",
    "!src/docs/**",
    "!src/types/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text-summary", "lcov", "cobertura"],

  reporters: [
    "default",
    ["jest-junit", { outputDirectory: "reports", outputName: "junit.xml" }],
  ],
};
