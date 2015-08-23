//var text = "0123456789abcdefghijklmnopqrstuvwxyz"

var text = "oplm2ybs7hi8cx6gdrtu53kz04j9aefqvw1n"
function log(str){
	console.log(str);
}

function getRandom(seed){
	var date = new Date();
	if(seed == null)
		return Math.floor(Math.random()*date.getTime());
	else
		return Math.floor(Math.random()*date.getTime()*(Math.random()*seed*7+365));
}

module.exports = {
	getNextKey: function(seed){
	var set = new Set();
	var item = [];

	while(set.size < 6){
		set.add(getRandom(seed));
	}

	set.forEach(function(value){
		item.push(text[value % text.length])
	});

	var hashKey = "";
	for(var i = 0; i < item.length; i++){
		hashKey += item[i];
	}

	return hashKey;
	}
}
//获取下一个6位口令的key值，seed为传入的种子数，默认为空值



/***************************************************/
/********************测试***************************/
/***************************************************/
/*
var TOTALNUM = 3000000
var map = new Map()
var startTime = new Date().getTime()
var pTotalTime = 0;

for (var i = 0; i < TOTALNUM; i++) {
	var key = getNextKey();
	var pTime = new Date().getTime()
	var pCount = 0;
	while(map.has(key)){
		pCount += 1;
		key = (pCount > 50) ? getNextKey(pCount) : getNextKey();
	}
	var eTime = new Date().getTime();
	pTotalTime += eTime - pTime;
	map.set(key,i);
};

var endTime = new Date().getTime()
log("花费的总时间:" + (endTime-startTime)/1000.0 + "s")
log("碰撞检测时间:" + pTotalTime/1000.0 + 's')
log("碰撞次数：" + pCount)
log(TOTALNUM + " : " + (TOTALNUM-map.size))*/






