//primary file for the API

const http = require("http");
const https = require("https");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
let config = require("./configuration");
const fs = require("fs");

let httpServer = http.createServer(function (req, res) {
  unifiedServer(req, res);
});

const httpsServerOptions = {
  key: fs.readFileSync("./https/privatekey.pem"),
  cert: fs.readFileSync("./https/certificate.pem"),
};
let httpsServer = https.createServer(httpsServerOptions, function (req, res) {
  unifiedServer(req, res);
});

httpServer.listen(config.httpPort, function () {
  console.log("listening on port " + config.httpPort);
});
httpsServer.listen(config.httpsPort, function () {
  console.log("listening on port " + config.httpsPort);
});

//unified serer

const unifiedServer = function () {
  const parseUrl = url.parse(req.url, true);
  const path = parseUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");
  const queryStringObject = parseUrl.pathname;
  const method = req.method.toLocaleLowerCase();
  const headers = req.headers;
  const decoder = new StringDecoder("utf-8");
  let buffer = "";

  req.on("data", function (data) {
    buffer += decoder.write(data);
  });
  req.on("end", function () {
   
    buffer += decoder.end();

    const chosenHandler =
      typeof router[trimmedPath] !== "undefined"
        ? router[trimmedPath]
        : handlers.notFound;
    let data = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      payload: buffer,
    };

    chosenHandler(data, function (statusCode, payload) {
      statusCode = typeof statusCode == "number" ? statusCode : 200;
      payload = typeof payload == "object" ? payload : {};

      var payloadString = JSON.stringify(payload);

      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);

      console.log("the response returned is ", statusCode, payloadString);
    });
  });
};

// the router

var handlers = {};
handlers.sample = function (data, callback) {
  callback(406, { name: "sample handler" });
};
handlers.notFound = function (data, callback) {
  callback(404);
};
const router = {
  sample: handlers.sample,
};
