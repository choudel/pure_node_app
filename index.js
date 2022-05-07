//primary file for the API

const http = require("http");
const https = require("https");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
let config = require("./lib/configuration");
const fs = require("fs");
const _data=require('./lib/data')
const handlers=require('./lib/handlers')
const helpers=require('./lib/helpers')
//testing
//@TODO delete it
_data.delete('test','newFile',function(err){
  console.log('this was the error ',err);
});



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

const unifiedServer = function (req, res) {
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
      payload: helpers.parseJsonToObject(buffer),
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


const router = {
  ping: handlers.ping,
  users: handlers.users
};
