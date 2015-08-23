// dao/userDao.js
// 实现与MySQL交互
var mysql = require('mysql');
var http = require("http");  
var url = require("url");  
var $conf = require('../conf/db');
var $util = require('../util/util');
var $sql = require('./userSqlMapping');
var getkey = require('../api/getnextkey');
var Download = require('../api/download');

// 使用连接池，提升性能
//var pool  = mysql.createPool($util.extend({}, $conf.mysql));
//var pool  = mysql.createPool($conf.mysql);

var pool = mysql.createPool({  
    host: '127.0.0.1', 
    user: 'root',
    password: '900706',
    database:'truck', // 前面建的user表位于这个数据库中
    port: 3306
});  

// 向前台返回JSON方法的简单封装
var jsonWrite = function (res, ret) {
  if(typeof ret === 'undefined') {
    res.json({
      code:'404',
      msg: '操作失败'
    });
  } else {
    res.json(ret);
  }
};

module.exports = {
  add: function (req, res, next) {
    pool.getConnection(function(err, connection) {
      // 获取前台页面传过来的参数
      var param = req.query || req.params;
      console.log('[userdao.js add]  start!');
      // 建立连接，向表中插入值
      // INSERT INTO files_data(id, uin, keyid, filepath) VALUES(0,?,?,?)
      connection.query($sql.insert, [param.uin, param.keyid, param.filepath], function(err, result) {
        if(result) {
          result = {
            code: 200,
            msg:'增加成功'
          };    
        }

        // 以json形式，把操作结果返回给前台页面
        jsonWrite(res, result);

        // 释放连接 
        connection.release();
      });
    });
  },
  
  //上传文件成功
  uploadFile: function (req, res, dstPath) {
    //console.log('****************************************');
    var key = getkey.getNextKey();
    pool.getConnection(function(err, connection) {
      // 获取前台页面传过来的参数
      var param = req.query || req.params;
      console.log('[userdao.js uploadFile]  start!');
      // 建立连接，向表中插入值

      
      var pCount = 0;
      var flag = 0;
      console.log('1: ' + key);
      
      //100次碰撞
      for(var i = 0; i <= 100 ;i++)//循环碰撞 在回调里面写循环有问题??????????????????????
      {
        //console.log("循环碰撞 start! " + key);
        pCount += 1;
        connection.query($sql.queryBykey, key, function(err, result) {

          //console.log('真奇怪 !');
          if(result.length > 0)
          {
            //console.log("had!");
            key = (pCount > 50) ? getkey.getNextKey(pCount) : getkey.getNextKey();
          }
          else
          {
           // console.log("new!");
            flag = 1;
          }
        
        });
        if(flag == 1)
          break;
      }

      console.log(key);
      console.log(dstPath);


      connection.query($sql.insert, [549003954, key, dstPath], function(err, result) {
        if(err){
           //jsonWrite(res,""); 
           console.log('err');
           key = "上传失败！"
        }
        else if(result) {
          console.log('result');
          result = {
            "code": "200", 
            "key": key,  
          };    
          // 以json形式，把操作结果返回给前台页面
          //jsonWrite(res,result);

        }
        
        // 释放连接 
        connection.release();
      });
    });
    res.render('doneUpload', { title: '轻传', key: key});
  },

  downloadFile: function(req, res, key){
    pool.getConnection(function(err, connection) {
      console.log('[userdao.js downloadFile]  start!');
      var temp = url.parse(req.url).pathname;  

      console.log(temp);

      var str = temp.substring(temp.lastIndexOf("=") + 1, temp.length);
      //console.log(asd);
      console.log('key = ' + str);
      connection.query($sql.queryBykey, str, function(err, result) {
      if(err){
        jsonWrite(res,result = {
            "code": "404", 
            "key": "访问数据库失败",  
          } );
      }
      else if(result.length > 0)
      {
        
        console.log('filepath : ' + result[0].filepath);

        filepath = result[0].filepath;
              // filename = filepath.substring(filepath.lastIndexOf("/") + 1, filepath.length);
              // filename = filename.substring(filename.indexOf("_") + 1, filename.length);
              // console.log('filename : ' + filename);
              // res.download(result[0].filepath, filename);
        Download.encapDownload(filepath, req, res);
      } 
      else
      {
        console.log('nosql');
        /*jsonWrite(res,result = {
            "code": "404", 
            "key": "没有该文件",  
          } );*/
          key = "口令错误";
          res.render('done2', { title: '轻传', key: key});
      }             
      });
    });
  }
};