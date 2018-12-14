/*!
 * cdk.js v0.2
 * (c) 2017-2018 cdk
 *
 */
;
(function() {

	function toString(val) {
		return val == null ?
			'' :
			typeof val === 'object' ?
			JSON.stringify(val, null, 2) :
			String(val)
	}

	function isTrue(v) {
		return v === true
	}

	function isFalse(v) {
		return v === false
	}

	//获取某个html元素的定位
	function GetPos(obj) {
		var pos = new Object();
		pos.x = obj.offsetLeft;
		pos.y = obj.offsetTop;
		while(obj = obj.offsetParent) {
			pos.x += obj.offsetLeft;
			pos.y += obj.offsetTop;
		}
		return pos;
	};

	function isContains(str, substr) {
		return str.indexOf(substr) >= 0;
	}
	//通过属性寻找元素
	function getElementByAttrValue(el, tag, attr, value) {
		var el = document.querySelector(el);
		var aElements = el.getElementsByTagName(tag);
		var aEle = [];
		for(var i = 0; i < aElements.length; i++) {
			if(aElements[i].getAttribute(attr) == value)
				aEle.push(aElements[i]);
		}
		return aEle;
	}

	function getElementByAttr(el, tag, attr) {
		var el = document.querySelector(el);
		var aElements = el.getElementsByTagName(tag);
		var aEle = [];
		for(var i = 0; i < aElements.length; i++) {
			if(aElements[i].getAttribute(attr) != null)
				aEle.push(aElements[i]);
		}
		return aEle;
	}
	//添加新样式
	function addNewStyle(newStyle) {
		var styleElement = document.getElementById('styles_js');

		if(!styleElement) {
			styleElement = document.createElement('style');
			styleElement.type = 'text/css';
			styleElement.id = 'styles_js';
			document.getElementsByTagName('head')[0].appendChild(styleElement);
		}

		styleElement.appendChild(document.createTextNode(newStyle));
	}
	//输入秒数返回时间长
	function formatDuring(mss) {
		var days = parseInt(mss / (60 * 60 * 24));
		var hours = parseInt((mss % (60 * 60 * 24)) / (60 * 60));
		var minutes = parseInt((mss % (60 * 60)) / (60));
		var seconds = (mss % 60);
		return days + " 天 " + hours + " 小时 " + minutes + " 分钟 " + seconds + " 秒 ";
	}

	function splitMore(str, signStart, signEnd) {
		var result = [];
		var signLength = signStart.length;
		var a, b;
		for(var i = 0; i < str.length; i++) {
			var index = str.substring(i, i + signLength);
			if(index === signStart) {
				a = i;
			}
			if(index === signEnd) {
				b = i + signLength;
				result.push(str.substring(a + 2, b - 2));
			}
		}
		return result;
	}
	//实例后执行
	//假如使用js改变值，待处理
	//通过Object.defineProperty()来劫持各个属性的setter，getter
	function cdk(el, data) {

		this._init(el);
		this._data(data);
		watchData(this);
		//watchData(data[0]);
		this.update(el, data);

	}
	//首先执行
	initCdk(cdk);

	//stateMixin(cdk);
	//eventsMixin(cdk);
	//lifecycleMixin(cdk);
	//renderMixin(cdk);

	function addData(obj, data) {

		obj.data1 = data[0];
		obj.data = data;
		obj.$data = [];
		obj.keys = Object.keys(data[0])
	}

	function watchData(obj) {
		var datas = obj.data1;
		//console.log("intercept");
		for(key in datas) {
			//console.log(key);
			//console.log(datas[key]);
			//var value = obj.$data[key] = datas[key];
			obj.$data[key] = datas[key];
			var value = datas[key];
			(function(obj, datas, key, value) {
				//需要闭包，这里的key只是引用，使用外部变量用的是循环最终的值
				Object.defineProperty(datas, key, {
					enumerable: true,
					configurable: true,
					get: function() {
						//console.log("intercept get:" + key + " / ");
						return value;
					},
					set: function(NewValue) {
						//当设置值的时候触发的函数,设置的新值通过参数value拿到
						//this.initValue = NewValue;
						if(NewValue == value) {
							return;
						}
						//obj.$data[key] = NewValue;
						//value有data的引用？直接引在新的对象里
						value = NewValue;
						console.log(obj.$data[key] + " --> " + NewValue);
						obj.update(obj.el, obj.data);

					}
				});
			})(obj, datas, key, value)

		}
		//暂时无需递归子键值
	}

	function initCdk(cdk) {
		cdk.prototype._init = function(options) {
			var cdk = this;
			this.el = options;
			//initEvents(vm);
			//initState(vm);
		};
		cdk.prototype._data = function(datas) {
			var cdk = this;
			addData(cdk, datas);
			//cdk.$data = datas;
			//initEvents(vm);
			//initState(vm);
		};
		cdk.prototype.update = function(el, data) {

			if(this.template === undefined) {

				this.template = document.querySelector(el).innerHTML;

			}

			var template = this.template;
			//console.log(template);
			var key = eval("data[0]." + Object.keys(data[0])[0]);
			var tmp = new Array;
			for(var i = 0; i < Object.keys(data[0]).length; i++) {
				var key = eval("data[0]." + Object.keys(data[0])[i]);
				template = template.replace("\{\{" + Object.keys(data[0])[i] + "\}\}", key);
			}

			//template = template.replace("\{\{"+Object.keys(data[0])[0]+"\}\}", key);
			document.querySelector(el).innerHTML = template;

			if(isContains(template, "cdk-for")) {
				var bDiv = getElementByAttr(el, 'li', 'cdk-for');
				var datakey = "";
				var outerHtml = [];
				var itemHtml = "";
				//console.log(bDiv.length);
				for(var i = 0; i < bDiv.length; i++) {
					var bAttr = bDiv[i].getAttribute('cdk-for');
					datakey = bDiv[i].innerHTML;

					datakey = splitMore(bDiv[i].innerHTML, "{{", "}}");
					//console.log(datakey[0]);
					//console.log(bDiv[i].innerHTML.split(".")[1].substring(0,bDiv[i].innerHTML.split(".")[1].length-2));
					//datakey = datakey.split(".")[1];
					//console.log(datakey);

					var orgOuterHtml = bDiv[i].outerHTML;
					//console.log(bAttr);
					itemHtml = "";
					for(var j = 0; j < eval("data[0]." + bAttr).length; j++) {
						orgOuterHtml = bDiv[i].outerHTML;
						for(var k = 0; k < datakey.length; k++) {
							//console.log();
							var key = eval("data[0]." + bAttr + "[" + j + "]." + datakey[k].split(".")[1]);
							//console.log(Object.keys(eval("data[0]."+bAttr+"[j]")));
							//console.log(key);
							orgOuterHtml = orgOuterHtml.replace("\{\{" + bAttr + "." + datakey[k].split(".")[1] + "\}\}", key);
						}

						itemHtml += orgOuterHtml;
					}
					outerHtml[i] = itemHtml;
					//console.log(outerHtml);
					//bDiv[i].outerHTML = outerHtml;
				}
				//console.log(outerHtml);
				for(var i = 0; i < bDiv.length; i++) {
					bDiv[i].outerHTML = outerHtml[i];
				}
			}

			if(isContains(template, "cdk-if")) {
				var bDiv = getElementByAttr(el, 'div', 'cdk-if');
				for(var i = 0; i < bDiv.length; i++) {
					var bAttr = bDiv[i].getAttribute('cdk-if');
					//console.log(eval("data[0]."+ bAttr));
					//data[0].hasOwnProperty(bAttr)
					if(data[0].hasOwnProperty(bAttr)) {
						if(eval("data[0]." + bAttr) == "false") {
							//alert("123");
							bDiv[i].style.display = "none";
						}
						if(eval("data[0]." + bAttr) == "true") {

							bDiv[i].style.display = "inherit";
						}
					} else {
						bDiv[i].style.display = function() {
							//console.log(bAttr);
							if(bAttr == "none" || bAttr == "inherit" || bAttr == "inline" || bAttr == "false" || bAttr == "true") {
								if(bAttr == "false") {
									return "none";
								} else if(bAttr == "true") {
									return "inherit";
								} else {
									return bAttr;
								}

							} else {
								//console.log(eval(bAttr));
								return eval(bAttr) === false ? "none" : "inherit";
							}

						}()
					}
				}
			}

			if(isContains(template, "@click")) {
				var bDiv = getElementByAttr(el, 'button', '@click');
				for(var i = 0; i < bDiv.length; i++) {
					var bAttr = bDiv[i].getAttribute('@click');
					bDiv[i].onclick = function() {
						eval(bAttr);
					}
				}
			}

			if(isContains(template, "cdk-bind")) {
				var aDiv = getElementByAttr(el, 'input', 'cdk-bind');
				for(var i = 0; i < aDiv.length; i++) {
					var aAttr = aDiv[i].getAttribute('cdk-bind');
					aDiv[i].setAttribute("data-index", i);
					aDiv[i].value = eval("data[0]." + aAttr);
					tmp[i] = aDiv[i].value;
					//监听里的变量不能用循环里的变量，
					aDiv[i].addEventListener('input', function(e) {
						var i = this.getAttribute("data-index");
						data[0][aAttr] = aDiv[i].value;
						console.log(aDiv[i].value);
						var a = template.indexOf(key);
						//alert(tmp[i]);
						var childNodes = document.querySelector(el).childNodes;
						for(var j = 0; j < childNodes.length; j++) {
							if(childNodes[j].innerHTML == tmp[i]) {
								childNodes[j].innerHTML = aDiv[i].value;
							}
						}
						tmp[i] = this.value;
					});
				}
			}

		}
		//console.log("initCdk");
	}

	//vue的数据监视器
	function stateMixin(Vue) {
		// flow somehow has problems with directly declared definition object
		// when using Object.defineProperty, so we have to procedurally build up
		// the object here.
		var dataDef = {};
		dataDef.get = function() { return this._data };
		var propsDef = {};
		propsDef.get = function() { return this._props }; {
			dataDef.set = function(newData) {
				warn(
					'Avoid replacing instance root $data. ' +
					'Use nested data properties instead.',
					this
				);
			};
			propsDef.set = function() {
				warn("$props is readonly.", this);
			};
		}
		Object.defineProperty(Vue.prototype, '$data', dataDef);
		Object.defineProperty(Vue.prototype, '$props', propsDef);

		Vue.prototype.$set = set;
		Vue.prototype.$delete = del;

		Vue.prototype.$watch = function(
			expOrFn,
			cb,
			options
		) {
			var vm = this;
			if(isPlainObject(cb)) {
				return createWatcher(vm, expOrFn, cb, options)
			}
			options = options || {};
			options.user = true;
			var watcher = new Watcher(vm, expOrFn, cb, options);
			if(options.immediate) {
				cb.call(vm, watcher.value);
			}
			return function unwatchFn() {
				watcher.teardown();
			}
		};
	}

	function template(el, data) {
		template = document.querySelector('#template').innerHTML,
			result = document.querySelector(el),
			i = 0, j = 0, len = data.length, data_len = Object.keys(data[i]).length,
			fragment = '';
		for(i = 0; i < len; i++) {
			fragment += template;
			for(j = 0; j < data_len; j++) {

				var key = eval("data[" + i + "]." + Object.keys(data[i])[j]);
				fragment = fragment
					.replace("\{\{" + Object.keys(data[i])[j] + "\}\}", key);
			}
		}

		result.innerHTML = fragment;
	}
	//图片模态框
	var showPic = function(el) {
		this.el = typeof(el) === "string" ? document.querySelector(el) : el;
		var oDiv = document.createElement('div');
		oDiv.innerHTML = '<div id="bag" class="bag"><div><a id="bag_a"  onclick="">×</a></div><img id="bag_img" src="" /></div>';
		document.body.appendChild(oDiv);
		var bag_a = document.getElementById("bag_a");

		bag_a.style.height = '200px';
		bag_a.style.width = '200px';
		bag_a.style.position = 'absolute';
		bag_a.style.color = '#fff';
		bag_a.style.lineHeight = '60px';
		bag_a.style.fontWeight = 'bold';
		bag_a.style.fontSize = '60px!important';
		bag_a.style.top = '30px';
		bag_a.style.left = '30px';
		var body = document.body;
		body.style.overflow = "hidden";
		body.style.height = '100%';
		body.style.width = '100%';
		var para = document.getElementById('bag');
		para.style.opacity = '0';
		para.style.display = 'none';
		para.style.height = '100%';
		para.style.width = '100%';
		para.style.background = "#333";
		para.style.position = 'absolute';
		para.style.color = '#fff';
		para.style.fontSize = '60px';
		para.style.top = '100%';
		para.style.left = '0px';
		para.style.zIndex = '0';
		para.style.transition = 'all 0.4s ';
		para.style.webkitTransition = 'all 0.3s ';
		var img = document.getElementById('bag').getElementsByTagName('img');
		for(var i = 0; i < img.length; i++) {
			img[i].style.position = 'absolute';
			img[i].style.height = "";
			img[i].style.width = '';
		}
		var a = document.getElementById('bag').getElementsByTagName('a');
		for(var i = 0; i < img.length; i++) {
			a[i].style.position = 'absolute';
			a[i].style.cursor = "pointer";
			a[i].style.marginLeft = "10px";
			a[i].style.fontSize = "40px";
			a[i].style.color = "#fff";
		}
		document.getElementById('bag').addEventListener('click', function() {
			document.getElementById('bag').style.height = "0%";
			document.getElementById('bag').style.opacity = "0";
			document.getElementById('bag').style.top = "100%";
			document.getElementById('bag_img').style.webkitTransform = "translate(0px," + 0 + "px) scale(0.2)  translateZ(0px)";
		})

		var img = document.getElementById('bag_img');
		img.style.height = "";
		img.style.width = '';
		img.style.webkitTransform = "translate(0px," + 0 + "px) scale(0.2)  translateZ(0px)";
		img.style.transition = 'all 0.3s ';
		img.style.webkitTransition = 'all 0.3s ';

		this.el.addEventListener('click', function(e) {
			if(e.target.src != undefined) {
				document.getElementById('bag').style.height = "100%";
				document.getElementById('bag').style.opacity = "1";
				document.getElementById('bag').style.display = "inherit";
				document.getElementById('bag').style.top = "0px";

				var im = document.createElement('img');
				im.src = e.target.src;
				img.style.position = 'absolute';
				img.style.height = "";
				img.style.width = '';

				img.style.top = document.documentElement.clientHeight * 0.5 + "px";
				img.style.left = document.documentElement.clientWidth * 0.5 + "px";
				img.style.marginLeft = im.width * -0.5 + "px";
				img.style.marginTop = im.height * -0.5 + "px";
				img.style.transition = 'all 0.9s ';
				img.style.webkitTransition = 'all 0.9s ';
				img.style.webkitTransform = "translate(0px," + 0 + "px) scale(1)  translateZ(0px)";
				document.getElementById('bag_img').src = e.target.src;
				if(im.height > document.documentElement.clientHeight * 0.8) {
					document.getElementById('bag_img').style.height = "80%"; //width有变化
					document.getElementById('bag_img').style.width = "";
					document.getElementById('bag_img').style.top = document.documentElement.clientHeight * 0.5 + "px";
					document.getElementById('bag_img').style.marginTop = document.documentElement.clientHeight * 0.8 * -0.5 + "px";
					img.style.left = document.documentElement.clientWidth * 0.5 + "px";
					img.style.marginLeft = img.width * -0.5 + "px";

				} else if(im.width > document.documentElement.clientWidth * 0.8) {
					document.getElementById('bag_img').style.height = "";
					document.getElementById('bag_img').style.width = "80%"; //height有变化
					document.getElementById('bag_img').style.left = document.documentElement.clientWidth * 0.5 + "px";
					document.getElementById('bag_img').style.marginLeft = document.documentElement.clientWidth * 0.8 * -0.5 + "px";
					img.style.top = document.documentElement.clientHeight * 0.5 + "px";
					img.style.marginTop = img.height * -0.5 + "px";
				}
			}
		});
	}

	var rightMenu = function(el) {
		this.el = typeof(el) === "string" ? document.getElementById(el) : el;
		var myMenu = this.el;
		myMenu.style.margin = "0px";
		myMenu.style.padding = "0px";
		myMenu.style.listStyle = "none";
		myMenu.style.backgroundColor = "#fff";
		myMenu.style.width = "150px";
		myMenu.style.position = "absolute"

		myMenu.style.zIndex = "100";
		myMenu.style.display = "none";
		myMenu.style.border = "1px solid #e9ecf3";
		myMenu.style.boxShadow = "0px 0px 15px -4px rgba(0, 0, 0, 0.5)";
		myMenu.style.width = "200px";
		var li = myMenu.getElementsByTagName("li");
		for(var i = 0; i < li.length; i++) {
			li[i].style.padding = "10px";
			li[i].style.cursor = "pointer";
			li[i].style.fontSize = "14px";
			li[i].style.fontFamily = "微软雅黑";
			li[i].addEventListener("mouseover", function() {
				this.style.backgroundColor = "#e9ecf3";
			})
			li[i].addEventListener("mouseout", function() {
				this.style.backgroundColor = "#fff";
			})
		}
		document.addEventListener("contextmenu", function(event) {
			event.preventDefault();
			myMenu.style.display = "block";
			//获取鼠标视口位置
			myMenu.style.top = event.clientY + "px";
			myMenu.style.left = event.clientX + "px";
		});
		document.addEventListener("click", function(event) {
			myMenu.style.display = "none";
		});

	}

	var buttonRipple = function(el) {

		addNewStyle(el + "{position: relative;" +
			"background-color: #4CAF50;" +
			"border: none;" +
			"font-size: 30px;" +
			"color: #FFFFFF;" +
			"margin: 0;" +
			"width: 200px;" +
			"height: 75px;" +
			"text-align: center;" +
			"-webkit-transform: perspective(1px) translateZ(0);" +
			"transform: perspective(1px) translateZ(0);" +
			"-webkit-transition-duration: 0.4s;" +
			"transition-duration: 0.4s;" +
			"text-decoration: none;" +
			"overflow: hidden;" +
			"cursor: pointer;}" +

			el + ':after {' +
			'content: "";' +
			'background: #90EE90;' +
			'display: block;' +
			'position: absolute;' +
			'padding-top: 300px;' +
			'padding-left: 300px;' +
			'margin-left: -25%;' +
			'margin-top: -75%;' +
			'opacity: 0; ' +
			'border-radius: 10000px;' +
			'transition: all 1s;}' +

			el + ':active:after {' +
			'padding: 0;' +
			'margin-left: 50%;' +
			'margin-top: -10%;' +
			'opacity: 1;' +
			'transition: 0s}' +

			el + ':before {' +
			'content: "";' +
			'position: absolute;' +
			'z-index: -1;' +
			'left: 50%;' +
			'right: 50%;' +
			'bottom: 0;' +
			'background: #ccc;' +
			'height: 8px;' +
			'-webkit-transition-property: left, right;' +
			'transition-property: left, right;' +
			'-webkit-transition-duration: 0.3s;' +
			'transition-duration: 0.3s;' +
			'-webkit-transition-timing-function: ease-out;' +
			'transition-timing-function: ease-out;}' +

			el + ':hover:before {' +
			'left: 0;right: 0;}');
	}

	var buttonRolling = function(options, type, fn, callback) {
		this.options = options;
		this.tx = typeof(options.txt) === "string" ? options.txt : "cdk";
		this.el = typeof(options.id) === "string" ? document.getElementById(options.id) : el;
		this.width = options.width.toString();
		this.height = options.height.toString();
		this.background1 = options.background1;
		this.background2 = options.background2;
		this.el.style.height = '50px';
		this.el.style.height = options.height;
		this.el.style.width = '100px';
		this.el.style.width = options.width;
		this.el.style.background = "#fff";
		this.el.style.border = "1px solid #ff0";
		this.el.style.position = 'relative';
		this.el.style.overflow = 'hidden';
		this.el.style.textAlign = 'center';
		this.el.style.margin = '0 auto';
		this.el.style.cursor = 'pointer';

		var para = document.createElement("div");
		para.id = 'buttonRolling_h';
		para.style.height = '50px';
		para.style.height = this.height;
		para.style.width = '100px';
		para.style.width = this.width;
		para.style.background = "#0062CC";
		para.style.background = this.background2;
		para.style.textAlign = 'center';
		para.style.lineHeight = this.height;
		para.style.position = 'absolute';
		para.style.color = '#fff';
		para.style.fontSize = '30px';
		para.style.top = '-50px';
		para.style.top = "-" + options.height;
		para.style.left = '0px';
		para.style.zIndex = '0';
		para.style.transition = 'all 0.3s linear';
		para.style.webkitTransition = 'all 0.3s linear';
		var node = document.createTextNode(this.tx);
		para.appendChild(node);
		this.el.appendChild(para);

		var para = document.createElement("div");
		para.id = 'buttonRolling_i';
		para.style.height = '50px';
		para.style.height = this.height;
		para.style.width = '100px';
		para.style.width = this.width;
		para.style.background = "#1E90FF";
		para.style.background = this.background1;
		para.style.textAlign = 'center';
		para.style.lineHeight = this.height;

		para.style.position = 'absolute';
		para.style.color = '#fff';
		para.style.fontSize = '30px';
		para.style.top = '0px';
		para.style.left = '0px';
		para.style.zIndex = '0';
		para.style.transition = 'all 0.3s linear';
		para.style.webkitTransition = 'all 0.3s linear';
		var node = document.createTextNode(this.tx);
		para.appendChild(node);
		this.el.appendChild(para);

		var h = document.getElementById("buttonRolling_h");
		var i = document.getElementById("buttonRolling_i");
		(callback && typeof(callback) === "function") && callback();

		if(window.addEventListener) {
			this.el.addEventListener(type, fn);
		} else if(window.attachEvent) {
			this.el.attachEvent("onclick", fn);
		}
		this.el.onmouseover = function(e) {
			//避免鼠标在DIV里面移动时也会可能触发onmouseover或onmouseout。		
			if(!e) e = window.event;
			var reltg = e.relatedTarget ? e.relatedTarget : e.toElement;
			while(reltg && reltg != this) reltg = reltg.parentNode;
			if(reltg != this) {
				// 这里可以编写 onmouseleave 事件的处理代码  
				//this.style.background = "#000";
				h.style.top = "0px";
				i.style.top = options.height;
			}
			//this.style.background = "#000";
			return true;
		}
		this.el.onmouseout = function(e) {
			//避免鼠标在DIV里面移动时也会可能触发onmouseover或onmouseout。		
			if(!e) e = window.event;
			var reltg = e.relatedTarget ? e.relatedTarget : e.toElement;
			while(reltg && reltg != this) reltg = reltg.parentNode;
			if(reltg != this) {
				// 这里可以编写 onmouseleave 事件的处理代码  
				//this.style.background = "#fff";
				h.style.top = "-" + options.height;
				i.style.top = "0px";
			}
			//this.style.background = "#fff";
			return true;
		}
	}

	buttonRolling.prototype = {

		setBg: function(bg) {
			this.el.style.background = bg;
		},
		setHeight: function(height) {
			this.el.style.height = height;
		},
		setWidth: function(width) {
			this.el.style.width = width;
		}
	};

	var FollowCursor = function(el, txt) {
		//全局对象
		this.txt = typeof(txt) === "string" ? txt : "cdk";
		this.el = typeof(el) === "string" ? document.getElementById(el) : el;
		var a = this.el;
		var para = document.createElement("div");
		para.id = 'FollowCursor_h';
		para.style.height = '40px';
		//para.style.height = this.height;
		para.style.width = '100px';
		//para.style.width = this.width;
		para.style.background = "#007AFF";
		para.style.opacity = "1";
		para.style.display = "none";
		para.style.borderRadius = "4px";
		//para.style.background = this.background2;
		para.style.textAlign = 'center';
		para.style.lineHeight = '40px';
		//para.style.lineHeight = this.height;
		para.style.position = 'absolute';
		para.style.color = '#fff';
		para.style.fontSize = '22px';
		para.style.top = '-50px';
		para.style.left = '0px';
		para.style.zIndex = '0';
		//para.style.transition = 'all 0.3s linear';
		//para.style.webkitTransition = 'all 0.3s linear';
		var node = document.createTextNode(this.txt);
		para.appendChild(node);
		document.body.appendChild(para);
		var para1 = document.createElement("div");
		para1.id = 'FollowCursor_g';
		para1.style.position = 'absolute';

		para1.style.opacity = "1";
		para1.style.display = "none";
		para1.style.top = '-10px';
		para1.style.left = '10px';
		para1.style.borderRight = '10px solid transparent';
		para1.style.borderLeft = '10px solid transparent';
		para1.style.borderBottom = '20px solid rgba(0,122,255,0.9)';

		document.body.appendChild(para1);
		a.onmousemove = function(e) {
			var x = event.clientX;
			var y = event.clientY;

			var h = document.getElementById("FollowCursor_h");
			h.style.display = "inherit";
			h.style.top = y + 40 + "px";
			h.style.left = x + 10 + "px";
			var g = document.getElementById("FollowCursor_g");
			g.style.display = "inherit";
			g.style.top = y + 28 + "px";
			g.style.left = x + 12 + "px";

		}
		a.onmouseout = function(e) {
			var h = document.getElementById("FollowCursor_h");
			h.style.display = "none";
			var g = document.getElementById("FollowCursor_g");
			g.style.display = "none";
		}
		a.onmouseover = function(e) {
			//避免鼠标在DIV里面移动时也会可能触发onmouseover或onmouseout。		
			if(!e) e = window.event;
			var reltg = e.relatedTarget ? e.relatedTarget : e.toElement;
			while(reltg && reltg != this) reltg = reltg.parentNode;
			if(reltg != this) {
				// 这里可以编写 onmouseleave 事件的处理代码
				//alert("fuck");

				//tips1();	
			}
			return true;
		}
	}

	var moveDiv = function(el, txt) {
		this.txt = typeof(txt) === "string" ? txt : "cdk";
		this.el = typeof(el) === "string" ? document.getElementById(el) : el;
		// 获取元素和初始值
		var oBox = this.el,
			disX = 0,
			disY = 0;
		// 容器鼠标按下事件
		oBox.onmousedown = function(e) {
			var e = e || window.event;
			//获取按下鼠标到div left  top的距离
			disX = e.clientX - this.offsetLeft;
			disY = e.clientY - this.offsetTop;
			//添加鼠标按下事件
			document.onmousemove = function(e) {
				var e = e || window.event;
				oBox.style.position = 'absolute';
				oBox.style.left = (e.clientX - disX) + 'px';
				oBox.style.top = (e.clientY - disY) + 'px';
				//left  当小于等于零时，设置为零 防止div拖出document之外
	
			};
			//添加鼠标抬起事件
			document.onmouseup = function() {
				//清空事件
				document.onmousemove = null;
				document.onmouseup = null;
			};
			return false;
		};
	}
	//html自定义标签无法实现其他标签的内部方法
	function cdkCustomTag(el, LabelName, obj) {
		var ele = document.querySelector(el);
		var XFoo = document.registerElement(LabelName, { prototype: Object.create(HTMLElement.prototype) });
		var a = new XFoo();
		a.innerHTML = obj;
		ele.appendChild(a);
	}

	function cdkComponent(el, LabelName, obj) {
		var ele = document.querySelector(el);
		for(var i = 0; i < ele.childNodes.length; i++) {
			var childnode = ele.childNodes[i];
			if(childnode.tagName === LabelName.toUpperCase()) { //toUpperCase()转大写
				//childnode.outerHTML = childnode.outerHTML.replace(LabelName,obj);
				//console.log(obj);
				//console.log(childnode.innerHTML);
				childnode.innerHTML = obj;
				//console.log(i);
			}
		}
	}

	//构造函数
	function cdkRouter() {
		this.routes = {};
		this.currentUrl = '';
		this.init();
	}
	cdkRouter.prototype = {
		//route 存储路由更新时的回调到回调数组routes中，回调函数将负责对页面的更新
		route: function(path, callback) {
			this.routes[path] = callback || function() {}; //给不同的hash设置不同的回调函数
		},
		//refresh 执行当前url对应的回调函数，更新页面
		refresh: function() {
			//console.log(this);
			//console.log(location.hash.slice(1)); //获取到相应的hash值
			this.currentUrl = location.hash.slice(1) || '/'; //如果存在hash值则获取到，否则设置hash值为/
			console.log(this.currentUrl);
			if(this.routes[this.currentUrl]!== undefined){
				this.routes[this.currentUrl](); //根据当前的hash值来调用相对应的回调函数 
			}
		},
		//init 监听浏览器url hash更新事件
		init: function() {
			//console.log(this === window);
			window.addEventListener('load', this.refresh.bind(this), false);
			window.addEventListener('hashchange', this.refresh.bind(this), false);
		},
	}

	//给window对象挂载属性
	window.moveDiv = moveDiv;
	window.FollowCursor = FollowCursor;
	window.buttonRolling = buttonRolling;
	window.buttonRipple = buttonRipple;
	window.cdk = cdk;
	window.template = template;
	window.showPic = showPic;
	window.rightMenu = rightMenu;
	window.cdkCustomTag = cdkCustomTag;
	window.cdkComponent = cdkComponent;
	window.cdkRouter = cdkRouter;

})(this)