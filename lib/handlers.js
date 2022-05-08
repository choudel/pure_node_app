var _data = require("./data");
var helpers = require("./helpers");
var handlers = {};

handlers.users = function (data, callback) {
  const acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._users = {};

handlers._users.post = function (data, callback) {
  const firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  const lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  const phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false;
  const password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  const tosAgreement =
    typeof data.payload.tosAgreement == "boolean" &&
    data.payload.tosAgreement == true
      ? true
      : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    _data.read("users", phone, function (err, data) {
      if (err) {
        var hashedPassword = helpers.hash(password);
        if (hashedPassword) {
          var userObject = {
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            hashedPassword: hashedPassword,
            tosAgreement: true,
          };
          _data.create("users", phone, userObject, function (err) {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { error: "could not create the new user" });
            }
          });
        } else {
          callback(500, { error: "could not hash thes user account" });
        }
      } else {
        callback(400, { error: "A user with that phone already exists" });
      }
    });
  } else {
    callback(400, { Error: "Missing required fields" });
  }
};

handlers._users.get = function (data, callback) {
  var phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length == 10
      ? data.queryStringObject.phone.trim()
      : false;

  if (phone) {
    var token =
      typeof data.headers.token == "string" ? data.headers.token : false;
    handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
      if (tokenIsValid) {
        
    _data.read("users", phone, function (err, data) {
      if (!err && data) {
        //remove the hashed password
        delete data.hashedPassword;
        callback(200, data);
      } else {
        callback(404);
      }
    });
      } else {
        callback(403, { error: "Missing required auth" });
      }
    })
  } else {
    callback(404, { error: "missing required field" });
  }
};
handlers._users.put = function (data, callback) {
  var phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false;
  const firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  const lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;

  const password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  if (phone) {
    
    if (firstName || lastName || password) {
      var token =
      typeof data.headers.token == "string" ? data.headers.token : false;
      handlers._tokens.verifyToken(token, phone, function (tokenIsValid){
        if(tokenIsValid){
          _data.read("users", phone, function (err, userData) {
            if (!err && userData) {
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.password = password;
              }
              _data.update("users", phone, userData, function (err) {
                if (!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, { error: "Couldnt update" });
                }
              });
            } else {
              callback(400, { error: "the specified user doesnt exist" });
            }
          });
        }else{callback
        (403,{error:'missing required header for auth'})}
      });
    
    } else {
      callback(400, { error: "Missing fields to update" });
    }
  } else {
    callback(400, { Error: "Missing required field" });
  }
};
handlers._users.delete = function (data, callback) {
  let phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length == 10
      ? data.queryStringObject.phone.trim()
      : false;

  if (phone) {
    var token =
      typeof data.headers.token == "string" ? data.headers.token : false;
      handlers._tokens.verifyToken(token, phone, function (tokenIsValid){
        if(tokenIsValid){
          _data.read("users", phone, function (err, data) {
            if (!err && data) {
              _data.delete("users", phone, function (err, data) {
                if (!err) {
                  callback(200);
                } else {
                  callback(500, { error: "couldnt delete" });
                }
              });
            } else {
              callback(400, { error: "couldnt find the user" });
            }
          });
        }else{
          callback
        (403,{error:'missing required header for auth'})
        }
      });
    
  } else {
    callback(404, { error: "missing required field" });
  }
};

handlers.tokens = function (data, callback) {
  const acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};
handlers._tokens = {};
handlers._tokens.post = function (data, callback) {
  const phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false;
  const password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  if (phone && password) {
    _data.read("users", phone, function (err, userData) {
      if (!err && userData) {
        var hashedPassword = helpers.hash(password);
        if (hashedPassword == userData.hashedPassword) {
          var tokenId = helpers.createRandomString(20);
          var expires = Date.now() + 1000 * 60 * 60;
          var tokenObject = {
            phone: phone,
            id: tokenId,
            expires: expires,
          };
          _data.create("tokens", tokenId, tokenObject, function (err) {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { error: "could not create a token " });
            }
          });
        } else {
          callback(400, { error: "password did not match" });
        }
      } else {
        callback(400, { error: "could not find the specified user" });
      }
    });
  } else {
    callback(400, { error: "wrong information" });
  }
};
handlers._tokens.get = function (data, callback) {
  var id =
    typeof data.queryStringObject.id == "string" &&
    data.queryStringObject.id.trim().length == 20
      ? data.queryStringObject.id.trim()
      : false;

  if (id) {
    _data.read("tokens", id, function (err, tokenData) {
      if (!err && tokenData) {
        //remove the hashed password

        callback(200, tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(404, { error: "missing required field" });
  }
};
handlers._tokens.put = function (data, callback) {
  const id =
    typeof data.payload.id == "string" && data.payload.id.trim().length == 20
      ? data.payload.id.trim()
      : false;
  const extend =
    typeof data.payload.extend == "boolean" && data.payload.extend == true
      ? true
      : false;
  if (id && extend) {
    _data.read("tokens", id, function (err, tokenData) {
      if (!err && tokenData) {
        if (tokenData.expires > Date.now()) {
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          _data.update("tokens", id, tokenData, function (err) {
            if (!err) {
              callback(200);
            } else {
              callback(500, { error: "could not update your expiry date" });
            }
          });
        } else {
          callback(400, { error: "the token specified has already expired" });
        }
      } else {
        callback(400, { error: "specified token doesnt exist" });
      }
    });
  } else {
    callback(400, { error: "missing required field" });
  }
};
handlers._tokens.delete = function (data, callback) {
  let id =
    typeof data.queryStringObject.id == "string" &&
    data.queryStringObject.id.trim().length == 20
      ? data.queryStringObject.id.trim()
      : false;

  if (id) {
    _data.read("tokens", id, function (err, tokenData) {
      if (!err && tokenData) {
        _data.delete("tokens", id, function (err, token) {
          if (!err) {
            callback(200);
          } else {
            callback(500, { error: "couldnt delete" });
          }
        });
      } else {
        callback(400, { error: "couldnt find the token" });
      }
    });
  } else {
    callback(404, { error: "missing required field" });
  }
};

handlers._tokens.verifyToken = function (id, phone, callback) {
  _data.read("tokens", id, function (err, tokenData) {
    if (!err && tokenData) {
      if (tokenData.phone == phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

handlers.ping = function (data, callback) {
  callback(200);
};
handlers.notFound = function (data, callback) {
  callback(404);
};
module.exports = handlers;
