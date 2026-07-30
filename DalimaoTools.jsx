/*
 * DalimaoTools - 模块化脚本启动器
 * 自动加载 Modularized_Scripts 文件夹内的所有模块
 * Author: 大狸猫
 * Version: 2.1
 */

// 获取脚本所在文件夹路径
function getScriptFolder() {
    try {
        return new File($.fileName).parent.fsName;
    } catch(e) {
        return Folder.desktop.fsName;
    }
}

// 加载模块脚本
function loadModules() {
    // 设置全局标记，告诉模块它们正在被启动器加载
    $.global.DALIMAO_LOADER_ACTIVE = true;
    
    // 注册函数：模块调用此函数向启动器注册自己，不再依赖文件名
    $.global.DALIMAO_REGISTER = function(moduleObj) {
        if (moduleObj && typeof moduleObj.buildUI === 'function') {
            $.global._DALIMAO_PENDING_MODULE = moduleObj;
        }
    };
    
    var scriptFolder = getScriptFolder();
    var modulesFolder = new Folder(scriptFolder + "/Modularized_Scripts");
    
    if (!modulesFolder.exists) {
        alert("错误：找不到 Modularized_Scripts 文件夹！\n请确保该文件夹与 DalimaoTools.jsx 在同一目录。");
        return [];
    }
    
    var modules = [];
    var files = modulesFolder.getFiles("*.jsx");
    
    // 按文件名排序
    files.sort(function(a, b) {
        return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
    });
    
    for (var i = 0; i < files.length; i++) {
        if (files[i] instanceof File) {
            try {
                // 跳过模板文件
                if (files[i].name.indexOf("00_") === 0 || files[i].name.indexOf("Template") !== -1) {
                    continue;
                }
                
                var baseName = decodeURI(files[i].name.replace(/^\d+_/, '').replace('.jsx', ''));
                
                // 读取文件内容，检查是否包含 DALIMAO_REGISTER 调用
                files[i].open("r");
                var fileContent = files[i].read();
                files[i].close();
                
                var moduleObj = null;
                
                if (fileContent.indexOf('DALIMAO_REGISTER') !== -1) {
                    // 模块化脚本：包含注册调用，执行后从 _DALIMAO_PENDING_MODULE 获取模块对象
                    $.global._DALIMAO_PENDING_MODULE = null;
                    $.evalFile(files[i]);
                    moduleObj = $.global._DALIMAO_PENDING_MODULE;
                }
                
                if (moduleObj && typeof moduleObj.buildUI === 'function') {
                    modules.push({
                        name: moduleObj.name || baseName,
                        displayName: moduleObj.displayName || moduleObj.name || baseName,
                        version: moduleObj.version || "1.0",
                        fileName: files[i].name,
                        buildUI: moduleObj.buildUI
                    });
                } else {
                    // 散装脚本：没有模块接口，创建按钮式执行界面
                    var scriptFile = files[i];  // 闭包保存文件引用
                    modules.push({
                        name: baseName,
                        displayName: "▶ " + baseName,
                        version: "1.0",
                        fileName: files[i].name,
                        isDirectScript: true,
                        buildUI: (function(file, name) {
                            return function(container) {
                                var mainGr = container.add("group {orientation:'column', alignment:['fill','fill'], alignChildren:['center','center']}");
                                mainGr.spacing = 20;
                                mainGr.margins = [20, 30, 20, 20];
                                
                                // 说明文本
                                var infoGr = mainGr.add("group {orientation:'column', alignChildren:['center','center']}");
                                infoGr.spacing = 10;
                                var info1 = infoGr.add("statictext", undefined, "这是一个直接执行的脚本");
                                info1.graphics.font = ScriptUI.newFont(info1.graphics.font.family, ScriptUI.FontStyle.REGULAR, 11);
                                info1.graphics.foregroundColor = info1.graphics.newPen(info1.graphics.PenType.SOLID_COLOR, [0.6, 0.6, 0.6], 1);
                                
                                var info2 = infoGr.add("statictext", undefined, file.name);
                                info2.graphics.font = ScriptUI.newFont(info2.graphics.font.family, ScriptUI.FontStyle.BOLD, 12);
                                
                                // 执行按钮
                                var btnGr = mainGr.add("group {orientation:'column', alignChildren:['center','center']}");
                                btnGr.spacing = 10;
                                var execBtn = btnGr.add("button", undefined, "执行脚本");
                                execBtn.preferredSize = [200, 40];
                                execBtn.graphics.font = ScriptUI.newFont(execBtn.graphics.font.family, ScriptUI.FontStyle.BOLD, 13);
                                
                                var statusText = btnGr.add("statictext", undefined, "就绪");
                                statusText.preferredSize = [200, 20];
                                statusText.justify = "center";
                                statusText.graphics.foregroundColor = statusText.graphics.newPen(statusText.graphics.PenType.SOLID_COLOR, [0.5, 0.7, 0.5], 1);
                                
                                execBtn.onClick = function() {
                                    try {
                                        statusText.text = "执行中...";
                                        statusText.graphics.foregroundColor = statusText.graphics.newPen(statusText.graphics.PenType.SOLID_COLOR, [1, 0.7, 0.2], 1);
                                        
                                        // 清除加载器标记，让脚本以独立模式运行
                                        var loaderFlag = $.global.DALIMAO_LOADER_ACTIVE;
                                        $.global.DALIMAO_LOADER_ACTIVE = undefined;
                                        
                                        $.evalFile(file);
                                        
                                        // 恢复标记
                                        $.global.DALIMAO_LOADER_ACTIVE = loaderFlag;
                                        
                                        statusText.text = "✓ 执行完成";
                                        statusText.graphics.foregroundColor = statusText.graphics.newPen(statusText.graphics.PenType.SOLID_COLOR, [0.3, 0.8, 0.3], 1);
                                    } catch(e) {
                                        statusText.text = "✗ 执行失败";
                                        statusText.graphics.foregroundColor = statusText.graphics.newPen(statusText.graphics.PenType.SOLID_COLOR, [0.9, 0.3, 0.3], 1);
                                        alert("脚本执行错误:\n" + file.name + "\n\n" + e.toString());
                                    }
                                };
                                
                                return mainGr;
                            };
                        })(scriptFile, baseName)
                    });
                }
            } catch(e) {
                // 如果加载失败，记录但不中断
                $.writeln("警告：加载模块失败 - " + files[i].name + ": " + e.toString());
            }
        }
    }
    
    // 清理全局注册函数和待注册模块
    $.global._DALIMAO_PENDING_MODULE = null;
    
    return modules;
}

// 主UI构建函数
function buildMainUI(thisObj) {
    var scriptName = "整装大狸猫 by 大狸猫";
    var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", scriptName, undefined, {resizeable:true});
    
    if (!(thisObj instanceof Panel)) pal.text = "Dalimao_Tools by 大狸猫";
    pal.alignChildren = ["left","top"];
    pal.spacing = 5;
    pal.margins = 10;
    
    // ==== 顶部导航栏：标签 + 图标按钮 + 滑块（合并为一行）====
    var slider_gr = pal.add("group", undefined, {name: "slider_gr"});
    slider_gr.orientation = "row";
    slider_gr.alignChildren = ["left","center"];
    slider_gr.spacing = 5;
    slider_gr.margins = 0;
    slider_gr.alignment = ["fill","top"];

    var dalimao_st = slider_gr.add("statictext", undefined, "狸猫启动器");

    var openFolderBtn = slider_gr.add("button", undefined, "\uD83D\uDCC1");
    openFolderBtn.preferredSize = [24, 20];
    openFolderBtn.helpTip = "打开脚本文件夹";

    var refreshBtn = slider_gr.add("button", undefined, "\u21BB");
    refreshBtn.preferredSize = [24, 20];
    refreshBtn.helpTip = "刷新脚本列表";

    var dalimao_index_st = slider_gr.add("statictext", undefined, "0");
    dalimao_index_st.preferredSize.width = 25;
    var panel_slider = slider_gr.add("slider", undefined, 0, 0, 0);
    panel_slider.alignment = ["fill","center"];
    var dalimao_st2 = slider_gr.add("statictext", undefined, "加载中...");
    dalimao_st2.preferredSize.width = 100;

    // ==== 标签面板容器 ====
    var tabContainer = pal.add("group", undefined, {name: "tabContainer"});
    tabContainer.orientation = "column";
    tabContainer.alignChildren = ["fill","fill"];
    tabContainer.alignment = ["fill","fill"];

    // 构建标签面板的函数（初始 + 刷新共用）
    var currentTabIndex = 0;

    function buildTabs(restoreIndex) {
        // restoreIndex: 如果传入了索引，刷新后恢复到该页签
        if (restoreIndex === undefined) restoreIndex = 0;
        // 清空容器（手动逐个移除，ScriptUI 没有 removeAll）
        while (tabContainer.children.length > 0) {
            tabContainer.remove(0);
        }

        // 加载模块（独立 try-catch 防止模块错误导致面板崩溃）
        var modules = [];
        try {
            modules = loadModules();
        } catch(loadErr) {
            var errGr = tabContainer.add("group {orientation:'column', alignment:['fill','fill'], alignChildren:['left','top']}");
            errGr.spacing = 5;
            var errTitle = errGr.add("statictext", undefined, "模块加载失败");
            errTitle.graphics.font = ScriptUI.newFont(errTitle.graphics.font.family, ScriptUI.FontStyle.BOLD, 12);
            var errDetail = errGr.add("statictext", undefined, loadErr.toString().substring(0, 200), {multiline:true});
            errDetail.preferredSize = [400, 60];
            errDetail.alignment = ["fill","top"];
            var errBtn = errGr.add("button", undefined, "复制错误信息");
            errBtn.preferredSize = [120, 22];
            errBtn.onClick = function() { alert("模块加载错误详情:\n\n" + loadErr.toString()); };
            return;
        }

        if (modules.length === 0) {
            var msg = tabContainer.add("statictext", undefined, "未找到可用模块！\n请检查 Modularized_Scripts 文件夹。");
            msg.alignment = ["center","center"];
            panel_slider.minvalue = 0;
            panel_slider.maxvalue = 0;
            panel_slider.value = 0;
            dalimao_st2.text = "无模块";
            return;
        }

        // 创建标签面板
        var tpanel = tabContainer.add("tabbedpanel", undefined, undefined, {name: "tpanel"});
        tpanel.alignChildren = "fill";
        tpanel.orientation = "column";
        tpanel.alignment = ["fill","fill"];
        tpanel.margins = 10;

        var tabs = [];

        for (var i = 0; i < modules.length; i++) {
            var tab = tpanel.add("tab", undefined, undefined, {name: modules[i].name + "_tab"});
            tab.text = modules[i].displayName;
            tab.orientation = "column";
            tab.alignChildren = ["left","top"];
            tab.spacing = 10;

            try {
                modules[i].buildUI(tab);
                tabs.push(tab);
            } catch(e) {
                var errInfo = "模块「" + modules[i].displayName + "」加载失败\n" +
                    "文件: " + modules[i].fileName + "\n" +
                    "错误: " + e.toString();
                var errGr = tab.add("group {orientation:'column', alignChildren:['left','top']}");
                errGr.spacing = 5;
                var errTitle = errGr.add("statictext", undefined, "模块「" + modules[i].displayName + "」加载失败");
                errTitle.graphics.font = ScriptUI.newFont(errTitle.graphics.font.family, ScriptUI.FontStyle.BOLD, 12);
                var errFile = errGr.add("statictext", undefined, "文件: " + modules[i].fileName);
                var errDetail = errGr.add("statictext", undefined, e.toString().substring(0, 200), {multiline:true});
                errDetail.preferredSize = [350, 50];
                errDetail.alignment = ["fill","top"];
                var errBtn = errGr.add("button", undefined, "复制错误信息");
                errBtn.preferredSize = [120, 22];
                errBtn.onClick = (function(info) {
                    return function() { alert(info); };
                })(errInfo);
                tabs.push(tab);
            }
        }

        // 更新滑块
        panel_slider.minvalue = 0;
        panel_slider.maxvalue = tabs.length - 1;
        panel_slider.value = 0;
        dalimao_index_st.text = "0";
        dalimao_st2.text = tabs.length > 0 ? tabs[0].text : "";

        // 滑块事件
        panel_slider.onChange = panel_slider.onChanging = function() {
            var idx = Math.round(this.value);
            if (idx >= 0 && idx < tabs.length) {
                tpanel.selection = tabs[idx];
                dalimao_index_st.text = idx;
                dalimao_st2.text = tabs[idx].text;
            }
        };

        // 标签切换事件
        tpanel.onChange = function() {
            if (this.selection) {
                for (var i = 0; i < tabs.length; i++) {
                    if (tabs[i] === this.selection) {
                        dalimao_index_st.text = i;
                        dalimao_st2.text = tabs[i].text;
                        panel_slider.value = i;
                        break;
                    }
                }
            }
        };

        // 默认选中指定页签
        if (tabs.length > 0) {
            var restoreIdx = Math.min(restoreIndex, tabs.length - 1);
            if (restoreIdx < 0) restoreIdx = 0;
            tpanel.selection = tabs[restoreIdx];
            panel_slider.value = restoreIdx;
            dalimao_index_st.text = restoreIdx;
            dalimao_st2.text = tabs[restoreIdx].text;
        }
    }

    // 初始构建
    try {
        buildTabs();
    } catch(initErr) {
        var initErrGr = pal.add("group {orientation:'column', alignment:['fill','fill'], alignChildren:['left','top']}");
        initErrGr.spacing = 5;
        var initErrTitle = initErrGr.add("statictext", undefined, "初始化失败");
        initErrTitle.graphics.font = ScriptUI.newFont(initErrTitle.graphics.font.family, ScriptUI.FontStyle.BOLD, 12);
        var initErrDetail = initErrGr.add("statictext", undefined, initErr.toString().substring(0, 200), {multiline:true});
        initErrDetail.preferredSize = [400, 60];
        initErrDetail.alignment = ["fill","top"];
        var initErrBtn = initErrGr.add("button", undefined, "复制错误信息");
        initErrBtn.preferredSize = [120, 22];
        initErrBtn.onClick = function() { alert("初始化失败详情:\n\n" + initErr.toString()); };
    }

    // ==== 按钮事件 ====
    openFolderBtn.onClick = function() {
        var modulesFolder = new Folder(getScriptFolder() + "/Modularized_Scripts");
        if (modulesFolder.exists) {
            modulesFolder.execute();
        } else {
            alert("文件夹不存在:\n" + modulesFolder.fsName);
        }
    };

    refreshBtn.onClick = function() {
        try {
            buildTabs(parseInt(dalimao_index_st.text) || 0);
            pal.layout.layout(true);
            pal.layout.resize();
        } catch(e) {
            alert("刷新失败: " + e.toString());
        }
    };

    // 布局
    pal.layout.layout(true);
    pal.layout.resize();
    pal.onResizing = pal.onResize = function () {
        this.layout.resize();
    };

    if (pal instanceof Window) pal.show();

    // 清除全局标记，允许模块独立运行
    $.global.DALIMAO_LOADER_ACTIVE = undefined;

    return pal;
}

// 执行主程序
try {
    buildMainUI(this);
} catch(topLevelErr) {
    alert("DalimaoTools 启动失败:\n" + topLevelErr.toString());
}