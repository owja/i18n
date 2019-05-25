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
};
