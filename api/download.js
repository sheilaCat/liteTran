var fs = require('fs')
/**
	工具：将filePath拆分得到fileName
*/
function splitFilePath(filePath){
    var lastOccOfSlash = filePath.lastIndexOf('/');
    return filePath.substr(lastOccOfSlash+1,filePath.length);
}

/**
 * [@description](/user/description) 新建一个叫Transfer的类，把请求的两个参数当成构造函数传进去。
 */
function Transfer(req, resp) {
    this.req = req;
    this.resp = resp;
}

/**
 * [@description](/user/description) 计算上次的断点信息
 * [@param](/user/param) {string} Range 请求http头文件中的断点信息，如果没有则为undefined，格式（range: bytes=232323-）
 * [@return](/user/return) {integer} startPos 开始的下载点
 */
Transfer.prototype._calStartPosition = function(Range) {
    var startPos = 0;
    if( typeof Range != 'undefined') {
        var startPosMatch = /^bytes=([0-9]+)-$/.exec(Range);
        startPos = Number(startPosMatch[1]);
    }
    return startPos;
}
/**
 * [@description](/user/description) 配置头文件
 * [@param](/user/param) {object} Config 头文件配置信息（包含了下载的起始位置和文件的大小）
 */
Transfer.prototype._configHeader = function(Config,filename) {
    var startPos = Config.startPos, 
        fileSize = Config.fileSize,
        resp = this.resp;
    // 如果startPos为0，表示文件从0开始下载的，否则则表示是断点下载的。
    if(startPos == 0) {
    	resp.setHeader('Content-Disposition', 'attachment; filename='+encodeURIComponent(filename));
        resp.setHeader('Accept-Range', 'bytes');
    } else {
        resp.setHeader('Content-Range', 'bytes ' + startPos + '-' + (fileSize - 1) + '/' + fileSize);
    }
    resp.writeHead(206, 'Partial Content', {
        'Content-Type' : 'application/octet-stream',
    });
}

/**
在nodejs中每一次http请求的头文件，已经被他封装在了http.ServerRequest的headers对象中，
用node inspector的方式进行调试，就可以很清楚的看到了http.ServerRequest和http.ServerResponse对象的结构.
剩下来要做的，就是从断开的位置继续读取文件，并将其返回给客户端，可以用nodejs提供的ReadStream来实现：
*/
/**
 * [@description](/user/description) 初始化配置信息
 * [@param](/user/param) {string} filePath
 * [@param](/user/param) {function} down 下载开始的回调函数
 */
Transfer.prototype._init = function(filePath, down) {
    var config = {};
    var self = this;
    fs.stat(filePath, function(error, state) {
        if(error)
            throw error;

        config.fileSize = state.size;
        var range = self.req.headers.range;
        config.startPos = self._calStartPosition(range);
        self.config = config;
        var filename = splitFilePath(filePath);
        console.log('filename : ' + filename);
        filename = filename.substring(filename.indexOf("_") + 1, filename.length);
        console.log('filename : ' + filename);
        self._configHeader(config, filename);
        down();
    });
}
/**
 * [@description](/user/description) 生成大文件文档流，并发送
 * [@param](/user/param) {string} filePath 文件地址
 */
Transfer.prototype.Download = function(filePath) {
    var self = this;
    fs.exists(filePath, function(exist) {
        if(exist) {
            self._init(filePath, function() {
                var config = self.config
                    resp = self.resp;
                fReadStream = fs.createReadStream(filePath, {
                    encoding : 'binary',
                    bufferSize : 1024 * 1024,
                    start : config.startPos,
                    end : config.fileSize
                });
                fReadStream.on('data', function(chunk) {
                    resp.write(chunk, 'binary');
                });
                fReadStream.on('end', function() {
                    resp.end();
                });
            });
        } else {
            console.log('文件不存在！');
            return;
        }
    });
}

function encapDownload(filePath,req,resp){
	var transfer = new Transfer(req, resp);
	transfer.Download(filePath);
}
exports.encapDownload = encapDownload;