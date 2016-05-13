/**
 * Created by leilihuang on 16/4/8.
 */
define(
    'entries/util/util',['jquery','template'],
    function ($,Template) {
        var util= {
            $head:$("#headTools"),
            $foot:$("#footTools"),
            initHead: function () {
                if(this.$head){
                    this.$head.load('/page/head.jsp');
                }
            },
            initFoot: function () {
                if(this.$foot){
                    this.$foot.load('/page/foot.jsp');
                }
            },
            /**
             * @pageNum 当前页码
             * @pageSize 每页显示总数*/
            pageStart: function (pageNum,pageSize) {
                return Number(pageNum - 1) * pageSize + 1;
            },
            /**
             * @leng 每页返回数组的长度
             * @pageNum 当前页码
             * @pageSize 每页显示总数*/
            pageEnd: function (leng,pageNum,pageSize) {
                return Number(leng) + Number(pageNum - 1) * pageSize;
            },
            /**
             * @total 总共多少条数
             * @pageSize 每页显示总数*/
            pageBind: function (total,pageSize,callBack) {
                $("#util_pages").pagination(total, {
                    tems_per_page: 1, //边缘页数
                    num_edge_entries:1,
                    num_display_entries: 4, //主体页数
                    callback: function (index) {
                        callBack(index);
                    },
                    items_per_page:pageSize ,//每页显示1项,
                    prev_text:"<",
                    next_text:">",
                    ellipse_text:"..."
                });
            },
            selectDiv: function (callback) {
                $(".div_select").on("click", function () {
                    $(this).nextAll(".sel_hideSle").show();
                });
                $(".sel_options").on("click", function () {
                    if(!$(this).hasClass("cur")){
                        var text=$(this).text();
                        $(this).addClass("cur").siblings(".cur").removeClass("cur");
                        $(this).parent().prevAll(".div_select").text(text);
                        if(callback){
                            callback($(this));
                        }
                    }
                    $(this).parent().hide();

                });
                //$(".sel_hideSle").blur(function () {
                //    $(this).hide();
                //});
                $(".sel_hideSle").blur(function () {
                    console.log(22);
                });
            },
            iCheck: function () {
                $('input.isCheck').iCheck({
                    checkboxClass: 'icheckbox_square',
                    radioClass: 'iradio_square',
                    increaseArea: '20%' // optional
                });
            },
            openImg: function (url) {
                var obj={
                    src:url
                };
                var open= function () {
                    var html=Template('util_openImg',obj);
                    $(html).find(".clone").on("click", function () {
                        $("#box_openImg").remove();
                    }).end().appendTo("body");
                };
                if($("#util_openImg").length>0){
                    open();
                }else{
                    $("#templateHide").load('../html/template/util.html', function () {
                        open();
                    });
                }
            },
            /**
             * @tplID tips_success 是成功   tips_error 是失败*/
            tipsAlert: function (title,html,tplId) {
                var obj={
                    title:title ? title : "提示信息",
                    html:html
                };
                var open= function () {
                    var html=Template(tplId,obj);
                    $(html).find(".clone").on("click", function () {
                        $(this).parents(".util_tips_box").remove();
                    }).end().appendTo("body");
                };
                if($("#"+tplId).length>0){
                    open();
                }else{
                    if($("#templateHide").length>0){
                        $("#templateHide").load('/dist/html/template/alert.html', function () {
                            open();
                        });
                    }else{
                        $('body').append('<div id="templateHide"></div>')
                        $("#templateHide").load('/dist/html/template/alert.html', function () {
                            open();
                        });
                    }

                }
            },
            requireURL: function (str) {
                return!!str.match(/(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/g);
            }
        };
        return util;
    }
);

/**
 * Created by leilihuang on 16/4/11.
 */
define(
    'entries/util/base',['jquery','entries/util/util'],
    function ($,Util) {
        var base={
            init: function (callback) {
                this.createFoot();
                this.createHead();
                callback();
            },
            createHead: function () {
                Util.initHead();
            },
            createFoot: function () {
                Util.initFoot();
            }
        };
        return base;
    }
);
/**
 * Created by leilihuang on 16/4/13.
 */
define(
    'entries/service/addEdit',['jquery', 'Class', 'entries/util/util', 'template', 'fileUpload'],
    function ($, Class, Util, template,WebUploader) {
        var addEdit = Class.create(
            {
                setOptions: function (opts) {
                    var options = {
                        required:0,
                        game_type:0,
                        game_sx:0,
                        param:{}
                    };
                    $.extend(true, this, options, opts);
                }
            }, {
                initTemp: function(callback){
                   this.getData(function(){
                    callback();
                   });
                },
                init: function (opts) {
                    this.setOptions(opts);
                    this.getParam();
                    this.initTemp(function(){
                        this.bindClick();
                    }.bind(this));                    
                },
                bindClick: function () {
                    this.selectDiv();
                    this.fileBtn();
                    this.subBind();
                    this.imgRemove();
                },
                getParam:function(){
                    this.param=Poss.getUrl();
                },
                getData: function(callback){
                    var _this=this;
                    $.ajax({
                        url:Poss.getHost('merchantapp/toview'),
                        type:'POST',
                        dataType:'json',
                        data: {appCode:_this.param.appCode},
                        success:function(d){
                            if (d.responseCode==1000){
                                var ary=[];
                                if(d.data.picUrlList){
                                    for(var i=0;i<d.data.picUrlList.length;i++){
                                        ary.push(d.data.picUrlList[i].picUrl);
                                    }
                                }

                                d.data.aryUrl=ary.join(',');

                                var html=template('tpl_con_box',d.data);
                                _this.game_type=d.data.gameType;
                                _this.game_sx=d.data.gameAttr;
                                $('#tpl_con').append(html);
                                _this.gamesBind(0,d.data.appType);
                                callback();                           
                            }else{
                                Util.tipsAlert(null,d.errorMsg,'tips_error');
                            }
                        }, error: function (e) {
                            Util.tipsAlert(null,"系统异常，请刷新重试！",'tips_error');
                        }
                    });
                },
                selectDiv: function () {
                    var _this=this;
                    $('.app_gameType').change(function(){
                        var code=$(this).val();
                        if (code == '10000000') {
                            $('.gameType').show();
                            $('.appType').hide();
                        } else if (code == '20000000') {
                            $('.gameType').hide();
                            $('.appType').hide();
                        } else{
                            $('.gameType').hide();
                            $('.appType').show();
                        }
                        _this.gamesBind(0,$(this).val());
                    });
                    $('.app_game_type').change(function () {
                       _this.gamesBind(1,$(this).val());
                    });
                },
                /**
                 * @status 0应用类型  1游戏类型*/
                gamesBind: function (status,id) {
                  $.ajax({
                      url:Poss.getHost('apptypeattr/appTypeAttrList'),
                      type:"GET",
                      dataType:'json',
                      data:{typeAttrParentCode:id},
                      success: function (d) {
                        if(d.responseCode=1000){
                            d.game_type=this.game_type;
                            d.game_sx=this.game_sx;
                            
                            if(status==0){
                                var html=template('tpl_games_select',d);
                                $('.app_game_type').empty().append(html);
                                if(d.data && d.data[0]){
                                    this.gamesBind(1,d.data[0].typeAttrCode);
                                }
                            }else{
                                var html=template('tpl_games_sx',d);
                                $('.app_game_sx').empty().append(html);
                            }
                        }else{
                            Util.tipsAlert(null,d.errorMsg,'tips_error');
                        }
                      }.bind(this),
                      error: function (e) {
                        Util.tipsAlert(null,"系统异常，请刷新重试！",'tips_error');
                      }
                  })
                },
                subBind: function () {
                  $('.btn_sub').on('click', function () {
                      var data=this.formVal();
                      data.appCode=this.param.appCode;
                          if(this.required!=1){
                              $.ajax({
                                  url:Poss.getHost('merchantapp/save'),
                                  type:'POST',
                                  dataType:'json',
                                  data:data,
                                  success: function (d) {
                                      if(d.responseCode==1000){
                                          window.location.href='appList.html';
                                      }else{
                                        Util.tipsAlert(null,d.errorMsg,'tips_error');
                                      }
                                  },
                                  error: function (e) {
                                        Util.tipsAlert(null,"系统异常，请刷新重试！",'tips_error');
                                  }
                              })
                          }else{
                              this.required=0;
                          }
                  }.bind(this));
                },
                formVal: function () {
                    var obj = {}, required = 0, _this = this;

                    if($('.app_gameType').val()=='10000000'){
                        $('.gameType').find('select').each(function () {
                            obj[$(this).attr('data-name')]=$(this).val();
                        });
                    }else if($('.app_gameType').val()=='20000000'){
                        $('.appType').find('select').each(function () {
                            obj[$(this).attr('data-name')]=$(this).val();
                        });
                    }else{
                    }

                    obj[$('.app_gameType').attr('data-name')]=$('.app_gameType').val();

                    $('input:text').each(function () {
                        if($('.app_gameType').val()=='10000000'){
                            if ($(this).hasClass('required')) {
                                if ($(this).val() == '') {
                                    _this.required = 1;
                                    if (!$(this).parents('.boxInput').hasClass('errorTips')) {
                                        $(this).parents('.boxInput').addClass('errorTips');
                                    }
                                } else {
                                    $(this).parents('.boxInput').removeClass('errorTips');
                                }
                            }
                            obj[$(this).attr('data-name')] = $(this).val();
                        }else{
                            if($(this).attr('data-name') != "appDesc"){
                                if ($(this).hasClass('required')) {
                                    if ($(this).val() == '') {
                                        _this.required = 1;
                                        if (!$(this).parents('.boxInput').hasClass('errorTips')) {
                                            $(this).parents('.boxInput').addClass('errorTips');
                                        }
                                    } else {
                                        $(this).parents('.boxInput').removeClass('errorTips');
                                    }
                                }
                                obj[$(this).attr('data-name')] = $(this).val();
                            }
                        }

                    });
                    $('textarea').each(function () {
                        if ($(this).hasClass('required')) {
                            if ($(this).val() == '') {
                                _this.required = 1;
                                if (!$(this).parents('.boxInput').hasClass('errorTips')) {
                                    $(this).parents('.boxInput').addClass('errorTips');
                                }

                            } else {
                                $(this).parents('.boxInput').removeClass('errorTips');
                            }
                        }
                        obj[$(this).attr('data-name')] = $(this).val();
                    });

                    $('input[type=hidden]').each(function () {
                        if ($(this).hasClass('required')) {
                            if ($(this).val() == '') {
                                _this.required = 1;
                                if (!$(this).parents('.boxInput').hasClass('errorTips')) {
                                    $(this).parents('.boxInput').addClass('errorTips');
                                }
                            }else {
                                $(this).parents('.boxInput').removeClass('errorTips');
                            }
                        }
                        if($(this).attr('data-name')){
                            obj[$(this).attr('data-name')] = $(this).val();
                        }
                    });


                    return obj;
                },
                imgRemove: function(){
                    var inputVal=$('#fileUrl').val();
                    var urlVal=inputVal.split(",");

                    $('.btn-del').on('click',function(){
                        var curUrl=$(this).siblings('img').attr('src');
                        for(var i=0;i<urlVal.length;i++){
                            if(urlVal[i]==curUrl){
                                urlVal.splice(i,1);
                            }
                        }

                        $(this).parent('.edit-img').remove();
                        $('#fileUrl').val(urlVal.join(","));
                    });
                },
                fileBtn: function () {
                    $('.btn_file').each(function (i, item) {
                        this.fileLoad(item);
                    }.bind(this));
                },
                fileLoad: function (item) {
                    var uploader = WebUploader.create({
                        // swf文件路径
                        //swf: "../js/webuploader-dist-0.1.5/Uploader.swf",
                        // 文件接收服务端。
                        server: Poss.getHost('merchantapp/v1/uploadfile'),
                        pick: $(item),
                        fileVal: "pic",
                        // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
                        resize: false,
                        auto: true,
                        accept: {
                            extensions: 'jpg,jpeg,bmp,png',
                            mimeTypes: 'image/*',
                            title: 'Images'
                        }
                    });
                    uploader.on( 'fileQueued', function(file) {
                        Util.tipsAlert(" ","加载中……",'tips_loading');
                    });
                    // 完成上传完了，成功或者失败，先删除进度条。
                    uploader.on( 'uploadComplete', function( file ) {
                        if($('.util_tips_box').length>0){
                           $('.util_tips_box').remove();
                        }
                    });
                    uploader.on('uploadSuccess', function (file, response) {
                        if(response.responseCode==1000){
                            if($(item).hasClass('btn_file_je')){
                                var img='<img  class="file_btn" src="'+response.data.imgUrl+'" alt=""/>',
                                    hideInput=$(item).parents('.boxInput').find(".imgUrl"),
                                    val=hideInput.val()=="" ? response.data.imgUrl : hideInput.val()+","+response.data.imgUrl;
                                $(item).parents('.boxInput').find('.img_box').append(img);
                                hideInput.val(val);
                            }else{
                                $(item).parents('.boxInput').find('img').attr('src', response.data.imgUrl).show();
                                $(item).parents('.boxInput').find(".imgUrl").val(response.data.imgUrl);
                                $(item).hide();
                            }
                        }else{
                            Util.tipsAlert(null,response.errorMsg,'tips_error');
                        }
                    });
                    uploader.on('uploadError', function (file) {
                         if($('.util_tips_box').length>0){
                            $(this).remove();
                        }
                    });
                }
            }
        );
        return addEdit;
    }
);
require(
    ['jquery','entries/util/base','entries/service/addEdit'],
    function ($,Base, addEdit) {
        $(function () {
            Base.init(function () {
                new addEdit();
            });
        });
    }
);
define("entries/action/addEdit.js", function(){});

/**
 * Created by leilihuang on 16/4/8.
 */
(function () {
    var obj = document.getElementById('requirejs'),
        baseUrl = obj && obj.getAttribute('data-url') ? obj.getAttribute('data-url') : './',
        isDebug = 0,
        bool=true;

    function getBaseUrl(url) {
        return baseUrl + url;
    }

    if(typeof(window.platform)!='object'){
        window.platform={};
    }

    Poss={
        host:'http://domesdk.qbao.com/',
        getHost: function (url) {
            return this.host+url;
        },
        /**打印日志
         * @text 内容
         * @status 0 在控制台打印  1 alert弹出层打印
         * */
        isDeBug: function (text,status) {
            if(!status){
                status=0;
            }
            if(bool){
                if(status==0){
                    console.log(text);
                }else{
                    alert(text);
                }
            }
        },
        getUrl: function (url) {
            if(!url){
                url=location.search;
            }else{
                url=url.split('?')[1];
            }
            var theRequest = {},strs;
            if (url.indexOf("?") != -1) {
                var str = url.substr(1);
                strs = str.split("&&");
                for(var i = 0; i < strs.length; i ++) {
                    theRequest[strs[i].split("=")[0]]=decodeURI(strs[i].split("=")[1]);
                }
            }

            return theRequest;

        },
        setEncodeURI: function (str) {
            return encodeURI(str);
        },
        getDecodeURI: function (str) {
            return decodeURI(str);
        }
    };

    var config = {
        paths: {
            jquery: [
                getBaseUrl('jquery.min')
            ],
            template: [
                getBaseUrl('template')
            ],
            pages:[
                getBaseUrl('jquery.pagination')
            ],
            iCheck:[
                getBaseUrl('icheck.min')
            ],
            Class:[
                getBaseUrl('class')
            ],
            datetimepicker:[
                getBaseUrl('jquery.datetimepicker')
            ],
            fileUpload:[
                getBaseUrl('webuploader')
            ]
        },
        shim: {
            jquery: {
                deps: [],
                exports: '$'
            },
            template: {
                deps: ['jquery'],
                exports: 'template'
            },
            pages:{
                deps:['jquery'],
                exports:'pages'
            },
            iCheck:{
                deps:['jquery'],
                exports:'iCheck'
            },
            Class:{
                deps:[],
                exports:'Class'
            },
            datetimepicker:{
                deps:['jquery'],
                exports:'datetimepicker'
            },
            fileUpload:{
                deps:['jquery'],
                exports:'fileUpload'
            }
        }
    };
    require.config(config);
})();
define("entries/main.js", function(){});

