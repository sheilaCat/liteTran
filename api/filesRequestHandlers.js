var querystring = require("querystring"), 
    fs = require("fs"),
    path = require("path"),
    formidable = require("formidable");
var async = require('async');
try {
  var zip = require("node-native-zip");
} catch (error) {
  console.log("node-native-zip: " + error);
}
var util = require('util');  
var body = '';
//var java = require("./jsCallJava");

// Change request type to real type
function typeToStr(strType) {
  var type = parseInt(strType);
    switch(type) {
        case 1:
          return "resourseType";
          break;
        case 2:
          return "documentType";
          break;
        case 3:
          return "codeType";
          break;
        case 4:
          return "toolType";
          break;
    }
    return;
}

// Get the suffix of file by file name.
function getSuffix(fileName) {
  var suffix = fileName.substring(fileName.lastIndexOf("."),fileName.length);
    switch(suffix){
      case ".ppt":
          suffix = "ppt";
          break;
      case ".pptx":
          suffix = "ppt";
          break;
      case ".doc":
          suffix = "doc";
          break;
      case ".docx":
          suffix = "doc";
          break;
      case ".pdf":
          suffix = "pdf";
          break;
      case ".jpg":
          suffix = "jpg";
          break;
      case ".mp4":
          suffix= "mp4";
          break;
      case ".psd":
          suffix = "psd";
          break;
      case ".txt":
          suffix = "txt";
          break;
      case ".zip":
          suffix = "zip";
          break;
      default:
          suffix = "other";
          break;
    }
    return suffix;
}
 
module.exports = {

  toUploadFile: function (request, response) 
  {
    console.log("Request handler 'upload' was called.");
    console.log("request = " + util.inspect(request,true));
    var fileType = typeToStr(request.body.type);
      var suffix = getSuffix(request.files.upload.name);
      var date = new Date();
      var obj = {
        "fileName" : request.body.filename,
        "fileType" : fileType,
        "fileSuffix" : suffix,
        "fileUploadDate" : date.getFullYear()+"-"+date.getMonth()+"-"+date.getDate(),
        "fileDescription" : request.body.describe,
        "fileLocation" : "/files/"+fileType+"/"+request.body.filename + request.files.upload.name.substring(request.files.upload.name.lastIndexOf("."),request.files.upload.name.length),
        "fileTimes" : 0
      };

      console.log("obj = " + util.inspect(obj,true));
      
      fs.writeFileSync( __dirname + "/../public" + obj.fileLocation, fs.readFileSync(request.files.upload.path) );
      var peopleId = parseInt(request.body.peopleId);
      mongoDB.uploadFile(peopleId,obj);
      fs.unlink(request.files.upload.path, function (error) {
        // body...
        if (error) {
          console.log("unlink error : = error"/* error*/);
        }
      });
      domToPng(__dirname + "/../public" + obj.fileLocation);
      console.log("files.upload.path = " + request.files.upload.path);
      response.redirect("/hall.html");
      return;
  }
}


