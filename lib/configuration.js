var environments = {};
environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: "staging",
  hashingSecret:"thisIsASecret",
  maxChecks:5
};
environments.production = {
  httpPort: 5000,
  httpsPort:5001,
  envName: "production",
  hashingSecret:"thisIsASecret",
  maxChecks:5
};

var currentEnvironment =
  typeof process.env.NODE_ENV == "string"
    ? process.env.NODE_ENV.toLocaleLowerCase()
    : "";

var environmentToExport =
  typeof environments[currentEnvironment] == "object"
    ? environments[currentEnvironment]
    : environments.staging;
module.exports = environmentToExport;
