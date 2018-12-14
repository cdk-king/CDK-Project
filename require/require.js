/*
js模块加载器原理实现
amd
参考：【模块化编程】理解requireJS-实现一个简单的模块加载器
*/

;(function(){

    //存储已经加载好的模块
    var moduleCache = {};
    //(依赖，回调)
    var require = function(deps,callback){
        //参数
        var params = [];
        //依赖数量
        var depCount = 0;

        var i;
        var len;
        var isEmpty = false;
        var modName;

        modName = document.currentScript && document.currentScript.id || "REQUIRE_MAIN";
        console.log(1+"加载"+modName);
        //有依赖
        if(deps.length){
            
            for(i = 0;i<deps.length;i++){
                //异步，闭包，储存i
                //引用传递是在栈中保存指针；值传递是在栈中保存具体的值
                (function(i){
                    //依赖数量+1
                    depCount++;
                    //加载依赖
                    loadMod(deps[i],function(param){
                        params[i] = param;
                        depCount--;
                        if(depCount==0){
                            //所有模块加载完，获取所有依赖模块返回参数，最后执行
                            saveModule(modName,params,callback);
                        }
                    });
                })(i)

            }
        }else{
            isEmpty = true;
        }
        //没有依赖，直接回调
        if(isEmpty){
            console.log(4+"等待加载完成后执行"+modName);
            //等待加载完成后执行
            setTimeout(function(){
                saveModule(modName,null,callback);
            },0);
        }

    };

    var _getPathUrl = function(modName){
        var url = modName;
        if(url.indexOf('.js')==-1){
            url = url + '.js';
        }
        return url;
    };

    var loadMod = function(modName,callback){
        var url = _getPathUrl(modName);
        var fs;
        var mod;
        //console.log(2+"loadMod"+modName);
        //发现依赖模块，添加onload
        if(moduleCache[modName]){
            console.log(5+"发现依赖模块，添加onload"+modName);
            mod = moduleCache[modName];
            //如果已加载
            if(mod.status == 'loaded'){
                console.log("已加载，一般不会吧");
                setTimeout(callback(this.params),0);
            }else{
                //如果未到加载状态直接往onLoad插入值，在依赖项加载好后会解除依赖
                mod.onload.push(callback);
            }
        }else{
            //没有发现依赖模块，初始化依赖模块
            console.log(3+"初始化"+modName);
            //moduleCache赋值
            mod = moduleCache[modName] = {
                modName:modName,
                status:'loading',
                export:null,
                onload:[callback]
            };
            //创建script标签
            var _script = document.createElement('script');
            _script.id = modName;
            _script.type = 'text/javascript';
            _script.charset = 'utf-8';
            _script.async = true;
            _script.src = url;
            //获取<script src="require.js" type="text/javascript"></script>作为兄弟节点
            fs = document.getElementsByTagName('script')[0];
            //insertBefore() 方法在您指定的已有子节点之前插入新的子节点。
            fs.parentNode.insertBefore(_script, fs);
            //script标签自动加载完后会直接运行

        }
    };
    //执行并保存
    var saveModule = function(modName,params,callback){
        //console.log(modName);
        //console.log(params);
        //console.log(callback);
        //console.log(moduleCache);
        var mod;
        var fn;
        //hasOwnProperty() 方法会返回一个布尔值,指示对象自身属性中是否具有指定的属性
        //有模块依赖
        if(moduleCache.hasOwnProperty(modName)){
            console.log(6+"执行"+modName);
            mod = moduleCache[modName];
            mod.status = 'loaded';
            //运行模块，储存返回对象
            mod.export = callback ? callback(params) : null;
            //shift() 方法用于把数组的第一个元素从其中删除，并返回第一个元素的值。
            //运行需要该模块依赖的方法
            while(fn = mod.onload.shift()){
                fn(mod.export);
            }

        }else{
            console.log(999);
            //将window代替Function类里this对象,
            //有回调就再window下带参数执行
            callback && callback.apply(window,params);
        }
    };

    window.require = require;
    window.define = require;


})(window)