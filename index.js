//primary file for the API

const http = require("http");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
let server = http.createServer(function (req, res) {
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
      res.writeHead(statusCode);
      res.end(payloadString);

      console.log("the response returned is ", statusCode, payloadString);
    });
  });
});

server.listen(3000, function () {
  console.log("listening on port 3000");
});

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
