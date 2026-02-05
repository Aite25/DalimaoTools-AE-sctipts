# Dalimao Tools 模块化脚本说明

## 概述
本文件夹包含 DalimaoTools 的所有模块化功能脚本。每个脚本既可以单独运行，也可以被 DalimaoTools 主启动器调用。

## 快速上手

### 使用现有模块
1. 运行 `DalimaoTools.jsx` - 在统一界面使用所有模块
2. 或直接运行本文件夹内的任何 `.jsx` 文件 - 单独使用某个功能

### 创建新模块
1. 复制 `00_ModuleTemplate.jsx`
2. 重命名为 `序号_功能名.jsx`
3. 修改代码实现你的功能
4. 保存后重新运行 `DalimaoTools.jsx` 即可看到新模块

## 模块列表
1. **01_KeyframesEase.jsx** - 关键帧缓动工具
2. **02_Position_offset.jsx** - 位置偏移工具
3. **03_Null.jsx** - 空对象创建工具
4. **04_Renamer.jsx** - 图层重命名工具
5. **05_Repeater.jsx** - 中继器工具
6. **06_PropertyTracer.jsx** - 属性追踪工具
7. **07_SliderCreator.jsx** - 滑块创建工具
8. **08_Grid.jsx** - 网格布局工具

## 模块规范

### 文件命名规范
- 格式：`序号_功能名称.jsx`
- 示例：`01_KeyframesEase.jsx`

### 模块结构
每个模块必须遵循以下结构：

```javascript
/*
 * 模块名称 - 功能描述
 * 可单独运行，也可被 DalimaoTools 调用
 * Author: 大狸猫
 */

// 模块导出对象
var ModuleNameModule = (function() {
    
    // 私有变量和函数
    var privateVar = 0;
    
    function privateFunction() {
        // ...
    }
    
    // UI创建函数 - 用于作为模块被调用时
    function buildUI(container) {
        // 创建UI元素
        var gr = container.add("group {...}");
        
        // 绑定事件
        gr.someButton.onClick = function() {
            // ...
        };
        
        return gr;
    }
    
    // 返回模块接口
    return {
        name: "ModuleName",           // 模块标识名
        displayName: "显示名称",       // UI显示名称
        version: "1.0",               // 版本号
        buildUI: buildUI              // UI构建函数
    };
})();

// 如果作为独立脚本运行
if (typeof module === 'undefined') {
    (function() {
        var win = (this instanceof Panel) ? this : new Window("palette", "模块名称", undefined, {resizeable:true});
        win.alignChildren = ["fill","top"];
        win.spacing = 10;
        win.margins = 10;
        
        ModuleNameModule.buildUI(win);
        
        win.layout.layout(true);
        win.layout.resize();
        win.onResizing = win.onResize = function () { this.layout.resize(); }
        
        if (win instanceof Window) win.show();
    })();
}
```

## 使用方法

### 单独运行模块
直接在 AE 中运行任何 `.jsx` 文件，会打开该模块的独立窗口。

### 通过启动器运行
运行 `DalimaoTools.jsx`，启动器会自动扫描本文件夹内的所有模块并创建对应的标签页。

## 添加新模块

1. 按照模块规范创建新的 `.jsx` 文件
2. 文件名以序号开头（如 `09_NewFeature.jsx`）
3. 将文件保存到 `Modularized_Scripts` 文件夹
4. 重新运行 `DalimaoTools.jsx`，新模块会自动加载

## 注意事项

- 模块变量名必须是唯一的（如 `KeyframesEaseModule`）
- 必须实现 `buildUI(container)` 函数
- 必须返回包含 `name`、`displayName`、`version` 和 `buildUI` 的对象
- UI 元素应该适配容器大小
