/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          types: ["node", "jest"],
          esModuleInterop: true,
          module: "ESNext",
          moduleResolution: "bundler",
          allowImportingTsExtensions: true,
          noEmit: true,
        },
      },
    ],
  },
};
