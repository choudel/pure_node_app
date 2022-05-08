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
    } else {
      callback(400, { error: "Missing fields to update" });
    }
  } else {
    callback(400, { Error: "Missing required field" });
  }
};
handlers._users.delete = function (data, callback) {
  let phone = typeof data.queryStringObject.phone == "string" &&
  data.queryStringObject.phone.trim().length == 10
    ? data.queryStringObject.phone.trim()
    : false;

if(phone) {
  _data.read("users", phone, function (err, data) {
    if (!err && data) {
      _data.delete('users',phone,function(err,data){
        if(!err){
          callback(200)
        }else{
          callback(500,{error:'couldnt delete'})
        }
      })      
    } else {
      callback(400,{error:'couldnt find the user'});
    }
  });
} else {
  callback(404, { error: "missing required field" });
}
};

handlers.ping = function (data, callback) {
  callback(200);
};
handlers.notFound = function (data, callback) {
  callback(404);
};
module.exports = handlers;
