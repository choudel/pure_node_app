const fs = require("fs");
const path = require("path");

//container
const lib = {};

lib.baseDir = path.join(__dirname, "/../.data/");

//write data to a file
lib.create = function (dir, file, data, callback) {
  fs.open(
    lib.baseDir + dir + "/" + file + ".json",
    "wx",
    function (err, fileDescriptor) {
      if (!err && fileDescriptor) {
        //convert data to a string
        const stringData = JSON.stringify(data);
        //write to a file then close it
        fs.writeFile(fileDescriptor, stringData, function (err) {
          if (!err) {
            fs.close(fileDescriptor, function (err) {
              if (!err) {
                callback(false);
              } else {
                callback("error closing the file");
              }
            });
          } else {
            callback("Error writing to new file");
          }
        });
      } else {
        callback("Could not create file , it may already exist");
      }
    }
  );
};

//read data from a file
lib.read = function (dir, file, callback) {
  fs.readFile(
    lib.baseDir + dir + "/" + file + ".json",
    "utf8",
    function (err, data) {
      callback(err, data);
    }
  );
};

//update data
lib.update = function (dir, file, data, callback) {
  fs.open(
    lib.baseDir + dir + "/" + file + ".json",
    "r+",
    function (err, fileDescriptor) {
      if (!err && fileDescriptor) {
        let stringData = JSON.stringify(data);

        fs.ftruncate(fileDescriptor, function (err) {
          if (!err) {
            fs.writeFile(fileDescriptor, stringData, function (err) {
              if (!err) {
                fs.close(fileDescriptor, function (err) {
                  if (!err) {
                    callback(false);
                  } else {
                    callback("Error closing the file");
                  }
                });
              } else {
                callback("Error writing to the existing file");
              }
            });
          } else {
            callback("Error truncating file");
          }
        });
      } else {
        callback("could not open the file it may not exist");
      }
    }
  );
};



// delete a file
lib.delete=function(dir, file, callback){
  fs.unlink(lib.baseDir+dir+'/'+file+'.json',function(err){
if(!err){
  callback(false);
}else{
  callback('Error deleting the file ')
}

  })
}
module.exports = lib;
