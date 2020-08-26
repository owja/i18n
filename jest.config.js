module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: [
        "<rootDir>/src",
    ],
    collectCoverageFrom: [
        "<rootDir>/src/**/*.ts",
    ],
    coverageDirectory: "./coverage/",
    collectCoverage: true,
    coverageReporters: ["json", "lcov", "text", "clover", "html"],
};
