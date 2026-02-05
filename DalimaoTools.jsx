/*
 * DalimaoTools - 模块化脚本启动器
 * 自动加载 Modularized_Scripts 文件夹内的所有模块
 * Author: 大狸猫
 * Version: 2.0
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
                
                // 解码文件名中的特殊字符（如 %20 空格）
                var baseName = decodeURI(files[i].name.replace(/^\d+_/, '').replace('.jsx', ''));
                
                // 检查是否是模块化脚本（通过读取文件内容判断）
                var isModularScript = false;
                files[i].open("r");
                var fileContent = files[i].read();
                files[i].close();
                
                // 检查是否包含模块导出对象（var XXXModule = ）
                var possibleNames = [
                    baseName + 'Module',
                    baseName.replace(/\s/g, '') + 'Module',
                    baseName.replace(/_/g, '') + 'Module',
                    baseName.replace(/[\s_]/g, '') + 'Module'
                ];
                
                for (var j = 0; j < possibleNames.length; j++) {
                    if (fileContent.indexOf('var ' + possibleNames[j]) !== -1) {
                        isModularScript = true;
                        break;
                    }
                }
                
                var moduleObj = null;
                
                if (isModularScript) {
                    // 只对模块化脚本执行 evalFile
                    $.evalFile(files[i]);
                    
                    // 尝试获取模块对象
                    for (var j = 0; j < possibleNames.length; j++) {
                        try {
                            var testModule = eval(possibleNames[j]);
                            if (testModule && typeof testModule.buildUI === 'function') {
                                moduleObj = testModule;
                                break;
                            }
                        } catch(e) {
                            // 继续尝试下一个名称
                        }
                    }
                }
                
                if (moduleObj) {
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
    
    // 顶部滑块组
    var slider_gr = pal.add("group", undefined, {name: "slider_gr"}); 
    slider_gr.orientation = "row"; 
    slider_gr.alignChildren = ["left","center"]; 
    slider_gr.spacing = 10; 
    slider_gr.margins = 0; 
    slider_gr.alignment = ["fill","top"]; 

    var dalimao_st = slider_gr.add("statictext", undefined, "狸猫启动器"); 
    var dalimao_index_st = slider_gr.add("statictext", undefined, "0"); 
    var panel_slider = slider_gr.add("slider", undefined, 0, 0, 0); 
    panel_slider.alignment = ["fill","center"]; 
    var dalimao_st2 = slider_gr.add("statictext", undefined, "加载中...");
    dalimao_st2.preferredSize.width = 120;
    
    // 加载模块
    var modules = loadModules();
    
    if (modules.length === 0) {
        var msg = pal.add("statictext", undefined, "未找到可用模块！\n请检查 Modularized_Scripts 文件夹。");
        msg.alignment = ["center","center"];
        
        if (pal instanceof Window) {
            pal.layout.layout(true);
            pal.show();
        }
        return pal;
    }
    
    // 创建标签面板
    var tpanel = pal.add("tabbedpanel", undefined, undefined, {name: "tpanel"}); 
    tpanel.alignChildren = "fill"; 
    tpanel.orientation = "column"; 
    tpanel.alignment = ["fill","fill"];
    tpanel.margins = 10; 
    
    var tabs = [];
    
    // 为每个模块创建标签页
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
            var errMsg = tab.add("statictext", undefined, "模块加载错误:\n" + e.toString());
            errMsg.alignment = ["center","center"];
            tabs.push(tab);
        }
    }
    
    // 更新滑块范围和标签
    panel_slider.maxvalue = tabs.length - 1;
    dalimao_st2.text = tabs.length > 0 ? tabs[0].text : "";
    
    // 滑块事件
    panel_slider.onChange = panel_slider.onChanging = function() {
        var idx = Math.round(this.value);
        if (idx >= 0 && idx < tabs.length) {
            tpanel.selection = tabs[idx];
            dalimao_index_st.text = idx;
            dalimao_st2.text = tabs[idx].text;
        }
    }
    
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
    }
    
    // 设置默认选中第一个标签
    if (tabs.length > 0) {
        tpanel.selection = tabs[0];
    }
    
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
buildMainUI(this);
