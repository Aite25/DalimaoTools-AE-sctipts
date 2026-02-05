/*
 * 模块模板 - 复制此文件创建新模块
 * 可单独运行，也可被 DalimaoTools 调用
 * Author: 你的名字
 */

// 模块导出对象 - 将 "Template" 替换为你的模块名
var TemplateModule = (function() {
    
    var scriptName = "Template";
    
    // ==== 私有变量 ====
    var myVariable = 0;
    
    // ==== 私有函数 ====
    function myPrivateFunction() {
        // 你的功能代码
    }
    
    // ==== UI创建函数 ====
    // 这个函数会被启动器调用来创建UI
    function buildUI(container) {
        // 使用 ScriptUI 资源字符串定义UI
        var ui_res =
        "group { orientation:'column', alignment:['fill','fill'], alignChildren:['left','top'], \
            gr1: Group { \
                myButton: Button { text:'点击我',preferredSize:[100,25] } \
                myText: StaticText { text:'状态: 就绪',preferredSize:[150,25] } \
            }, \
        }";
        
        var gr = container.add(ui_res);
        
        // ==== 事件绑定 ====
        gr.gr1.myButton.onClick = function() {
            app.beginUndoGroup(scriptName);
            try {
                myPrivateFunction();
                this.parent.myText.text = "状态: 完成";
            } catch(e) {
                alert("错误: " + e.toString());
            }
            app.endUndoGroup();
        };
        
        return gr;
    }
    
    // ==== 返回模块接口 ====
    return {
        name: "Template",                    // 模块标识名（英文）
        displayName: "模板模块",             // UI显示名称（可中文）
        version: "1.0",                      // 版本号
        author: "大狸猫",                    // 作者
        description: "这是一个模块模板",     // 描述
        buildUI: buildUI                     // UI构建函数
    };
})();

// ==== 独立运行代码 ====
// 当作为独立脚本运行时，创建独立窗口
if (!$.global.DALIMAO_LOADER_ACTIVE) {
    // 确保在独立运行时清除标志（防止残留）
    $.global.DALIMAO_LOADER_ACTIVE = undefined;
    
    (function() {
        var win = new Window("palette", "模板模块 by 大狸猫", undefined, {resizeable:true});
        win.alignChildren = ["fill","top"];
        win.spacing = 10;
        win.margins = 10;
        
        TemplateModule.buildUI(win);
        
        win.layout.layout(true);
        win.layout.resize();
        win.onResizing = win.onResize = function () { this.layout.resize(); }
        
        if (win instanceof Window) {
            win.center();
            win.show();
        }
    })();
}
