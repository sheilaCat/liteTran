var express = require('express');
var router = express.Router();                                                                                                                         
var multiparty = require('multiparty');
var util = require('util');
var fs = require('fs');
var userDao = require('../dao/userDao');
var getkey = require('../api/getnextkey');

/* 首页 */
router.get('/', function(req, res, next) {
  res.render('index', { title: '轻传' });
});

/* 上传页面 */
router.get('/upload', function(req, res, next) {
  res.render('upload', { title: '轻传' });
});

/* 下载页面 */
router.get('/download', function(req, res, next) {
  res.render('download', { title: '轻传' });
});

/* 上传文件 */
router.post('/uploading', function(req, res, next){
  //生成multiparty对象，并配置下载目标路径
  var form = new multiparty.Form({uploadDir: './public/files/'});
  //下载后处理
  form.parse(req, function(err, fields, files) {
    var filesTmp = JSON.stringify(files,null,2);

    if(err){
      console.log('parse error: ' + err);
    } else {
      console.log('parse files: ' + filesTmp);
      var inputFile = files.inputFile[0];
      var uploadedPath = inputFile.path;
      if(inputFile.originalFilename === '') {
        fs.unlinkSync(uploadedPath); // 删除生成的随机文件
        res.render('done1', { title: '轻传', key: '请返回选择文件再上传'});
      } else {
        var dstPath = './public/files/' + getkey.getNextKey() + '_' + inputFile.originalFilename;
        //重命名为真实文件名
        fs.rename(uploadedPath, dstPath, function(err) {
          if(err){
            console.log('rename error: ' + err);
          } else {
            console.log('rename ok');
            userDao.uploadFile(req, res, dstPath);
          }
        });
      }
    }
 });

});

/* 下载文件 */
router.get('/download/key=:key',function(req,res,next){
  userDao.downloadFile(req,res,next); 
});

module.exports = router;