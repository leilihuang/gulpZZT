$(function () {
	var util = {
		ajax:function (url,callback,data,type) {
			$.ajax({
				url:url,
				type:type || 'GET',
				dataType:'json',
				data:data || {},
				success:function(d){
					callback(d);
				},
				error:function(error){

				}
			})
		},
		level3:function ($dom) {
			$dom.on('change',function () {
				var next = $(this).next();
				util.ajax('/getOption.json',function (d) {
					next.empty().append(template('tpl-level-box',d));
				});
			});
		},
		hoverBind:function ($dom,callback) {
			$dom.on('click',function () {
				$(this).addClass('active').siblings('.active').removeClass('active');
				callback($(this));
			});
		},
		divSelect:function (cls) {
			$('.selectpicker').selectpicker({
				style: cls || '',
				size: 4
			});
		},
		datePicker:function () {
			$('.datetimepicker').datetimepicker({
				format: 'yyyy-mm-dd hh:ii'
			});
		}
	};
	var nav = {
		init:function () {
			this.eventBind();
			util.divSelect('btn-success');
		},
		eventBind:function () {
			this.selectToggle();
		},
		selectToggle:function () {
			// $('.dropdown-toggle').dropdown();
			$('#statePhone').on('change',function () {
				var val = $(this).val(),
					$divSel = $(this).next('.bootstrap-select').find('button');
				if(val == 0){
					$divSel.addClass('btn-success').removeClass('btn-warning');
				}else{
					$divSel.addClass('btn-warning').removeClass('btn-success');
				}
			})
		}
	};

	var menu = {
		menus:[{
			icon:'icon-tubiao210 active'
		},{
			icon:'icon-baobiao'
		},{
			icon:'icon-icon'
		},{
			icon:'icon-erji3'
		}],
		init:function () {
			this.initMenu();
			this.eventBind();
		},
		initMenu:function () {
			$('#sidebar-box').empty().append(template('tpl-side-menu',{sideMenu:this.menus}));
		},
		eventBind:function () {
			this.tabBind();
			this.sideMenu();
		},
		tabBind:function () {
			$('#mayTab').find('a').on('click',function (e) {
				e.preventDefault();
				$(this).tab('show');
				var id = $(this).attr('href'),
					tpl = $(this).attr('data-tpl');
				content.listBind($(id),tpl);
			})
		},
		sideMenu:function () {
			util.hoverBind($('#sidebar-box').find('.iconfont'),function ($this) {
				var index = $this.attr('data-index');
				if(index == 0){

				}else {

				}
			});
		}
	};

	var content = {
		init:function () {
			this.eventBind();
			util.datePicker();
		},
		eventBind:function () {
			this.listBind($('#newTh'),'tpl-tab1-box');
		},
		getTabel:function(){
			util.ajax('/getTable.json',function (d) {
				$('#table-body').empty().html(template('tpl-table-body',d));
			})
		},
		levelBind:function () {
			var $one = $('#con-select').find('.one'),
				$two = $('#con-select').find('.two'),
				$three = $('#con-select').find('.three');
			util.ajax('/getOption.json',function (d) {
				$one.empty().append(template('tpl-level-box',d));
			});
			util.level3($one);
			util.level3($two);
		},
		listBind:function ($listBox,tpl) {
			util.ajax('/getTab1.json',function (d) {
				$listBox.find('.list-box').empty().append(template(tpl,d));
				var $lists = $listBox.find('.list-box').find('.lists');
				util.hoverBind($lists,function ($this) {
					var id = $this.attr('data-index'),
						tplInfo = $this.attr('data-info');
					$('#content-box').empty().append(template(tplInfo,{type:id}));
					this.levelBind();
					this.getTabel();
				}.bind(this));
			}.bind(this));
		}
	};

	nav.init();
	menu.init();
	content.init();

});
