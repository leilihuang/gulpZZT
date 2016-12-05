var Random = Mock.Random;

//表格
Mock.mock(/\/getTable\.json/,{
	"success|1":true,
		'list|10':[{
		'id|+1':0,
		'zhujiao|+1':2222,
		'time':'@datetime',
		'phone|+1':2222,
		'text':Random.csentence(),
		'ramark':Random.cparagraph()
	}]
});

//三级联动
Mock.mock(/\/getOption\.json/,{
	'list|1-10':[{
		'value|+1':0,
		'name':'@name'
	}]
});
//tab1列表
Mock.mock(/\/getTab1\.json/,{
	'lists|10':[{
		'phone|+1':18802789980,
		'name':'@name',
		'time':'@datetime',
		'zuoxi|+1':22332,
		'img|1':['icon-5dianhuazhuanbo phone-success','icon-yibo phone-warning']
	}]
});