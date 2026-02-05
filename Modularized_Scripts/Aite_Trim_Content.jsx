/*
 * Trim Precomp to Content - 预合成裁剪工具
 * 功能：根据预合成内部图层的实际内容范围，自动trim预合成图层
 * 可单独运行，也可被 DalimaoTools 调用
 * 作者：Aite
 */

var TrimPrecompModule = (function() {
    
    var scriptName = "Trim Precomp to Content";
    
    // 获取预合成信息
    function getPrecompInfo(layer) {
        if (!(layer.source instanceof CompItem)) {
            return null;
        }
        
        var precomp = layer.source;
        if (precomp.numLayers === 0) {
            return null;
        }
        
        var earliestInPoint = null;
        var latestOutPoint = null;
        
        for (var i = 1; i <= precomp.numLayers; i++) {
            var subLayer = precomp.layer(i);
            var layerInPoint = subLayer.inPoint;
            var layerOutPoint = subLayer.outPoint;
            
            if (earliestInPoint === null || layerInPoint < earliestInPoint) {
                earliestInPoint = layerInPoint;
            }
            if (latestOutPoint === null || layerOutPoint > latestOutPoint) {
                latestOutPoint = layerOutPoint;
            }
        }
        
        return {
            layer: layer,
            precomp: precomp,
            earliestInPoint: earliestInPoint,
            latestOutPoint: latestOutPoint,
            layerStartTime: layer.startTime
        };
    }
    
    // 执行trim操作
    function trimPrecomp(info) {
        var newInPoint = info.layerStartTime + info.earliestInPoint;
        var newOutPoint = info.layerStartTime + info.latestOutPoint;
        info.layer.inPoint = newInPoint;
        info.layer.outPoint = newOutPoint;
    }
    
    // 获取图层的第一个关键帧时间
    function getFirstKeyframeTime(layer) {
        var firstTime = null;
        
        // 遍历图层的所有属性
        function scanProperty(prop) {
            if (prop.numKeys > 0) {
                var keyTime = prop.keyTime(1);
                if (firstTime === null || keyTime < firstTime) {
                    firstTime = keyTime;
                }
            }
            
            // 递归遍历子属性
            if (prop.numProperties !== undefined) {
                for (var i = 1; i <= prop.numProperties; i++) {
                    try {
                        scanProperty(prop.property(i));
                    } catch(e) {}
                }
            }
        }
        
        // 扫描所有可动画属性
        try {
            scanProperty(layer.transform);
            if (layer.effect && layer.effect.numProperties > 0) {
                scanProperty(layer.effect);
            }
            if (layer.mask && layer.mask.numProperties > 0) {
                scanProperty(layer.mask);
            }
        } catch(e) {}
        
        return firstTime;
    }
    
    // 获取图层的最后一个关键帧时间
    function getLastKeyframeTime(layer) {
        var lastTime = null;
        
        // 遍历图层的所有属性
        function scanProperty(prop) {
            if (prop.numKeys > 0) {
                var keyTime = prop.keyTime(prop.numKeys);
                if (lastTime === null || keyTime > lastTime) {
                    lastTime = keyTime;
                }
            }
            
            // 递归遍历子属性
            if (prop.numProperties !== undefined) {
                for (var i = 1; i <= prop.numProperties; i++) {
                    try {
                        scanProperty(prop.property(i));
                    } catch(e) {}
                }
            }
        }
        
        // 扫描所有可动画属性
        try {
            scanProperty(layer.transform);
            if (layer.effect && layer.effect.numProperties > 0) {
                scanProperty(layer.effect);
            }
            if (layer.mask && layer.mask.numProperties > 0) {
                scanProperty(layer.mask);
            }
        } catch(e) {}
        
        return lastTime;
    }
    
    // 裁剪图层入点到第一个关键帧 (Alt+[)
    function trimLayerInToFirstKey() {
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) return;
        if (comp.selectedLayers.length === 0) return;
        
        app.beginUndoGroup(scriptName + " - Trim In");
        
        for (var i = 0; i < comp.selectedLayers.length; i++) {
            var layer = comp.selectedLayers[i];
            var firstKeyTime = getFirstKeyframeTime(layer);
            
            if (firstKeyTime !== null) {
                layer.inPoint = firstKeyTime;
            }
        }
        
        app.endUndoGroup();
    }
    
    // 裁剪图层出点到最后一个关键帧 (Alt+])
    function trimLayerOutToLastKey() {
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) return;
        if (comp.selectedLayers.length === 0) return;
        
        app.beginUndoGroup(scriptName + " - Trim Out");
        
        for (var i = 0; i < comp.selectedLayers.length; i++) {
            var layer = comp.selectedLayers[i];
            var lastKeyTime = getLastKeyframeTime(layer);
            
            if (lastKeyTime !== null) {
                layer.outPoint = lastKeyTime;
            }
        }
        
        app.endUndoGroup();
    }
    
    // 主处理函数
    function processSelectedLayers() {
        var comp = app.project.activeItem;
        
        if (!comp || !(comp instanceof CompItem)) {
            alert("请先打开一个合成！");
            return;
        }
        
        if (comp.selectedLayers.length === 0) {
            alert("请先选择至少一个图层！");
            return;
        }
        
        // 收集所有预合成信息
        var precompInfos = [];
        for (var j = 0; j < comp.selectedLayers.length; j++) {
            var info = getPrecompInfo(comp.selectedLayers[j]);
            if (info !== null) {
                precompInfos.push(info);
            }
        }
        
        if (precompInfos.length === 0) {
            alert("选中的图层中没有有效的预合成！");
            return;
        }
        
        app.beginUndoGroup(scriptName);
        
        var processedCount = 0;
        for (var i = 0; i < precompInfos.length; i++) {
            trimPrecomp(precompInfos[i]);
            processedCount++;
        }
        
        app.endUndoGroup();
    }
    
    // UI创建函数
    function buildUI(container) {
        var ui_res =
        "group { orientation:'column', alignment:['fill','fill'], alignChildren:['center','center'], spacing:15, \
            panel1: Panel { text:'预合成裁剪', orientation:'column', alignChildren:['center','center'], \
                executeBtn: Button { text:'Trim 选中的预合成', preferredSize:[200,40] } \
            }, \
            panel2: Panel { text:'图层关键帧裁剪', orientation:'row', alignChildren:['center','center'], spacing:10, \
                trimInBtn: Button { text:'Alt+[  裁剪入点', preferredSize:[130,30] } \
                trimOutBtn: Button { text:'Alt+]  裁剪出点', preferredSize:[130,30] } \
            }, \
        }";
        
        var gr = container.add(ui_res);
        
        // 设置按钮提示信息
        gr.panel1.executeBtn.helpTip = "根据预合成内部图层的实际内容范围自动trim预合成\n• 选择一个或多个预合成图层\n• 点击按钮自动trim到内容范围";
        gr.panel2.trimInBtn.helpTip = "裁剪图层入点到第一个关键帧（模拟Alt+[）\n• 选择一个或多个图层\n• 扫描所有属性的关键帧\n• 将入点对齐到最早的关键帧";
        gr.panel2.trimOutBtn.helpTip = "裁剪图层出点到最后一个关键帧（模拟Alt+]）\n• 选择一个或多个图层\n• 扫描所有属性的关键帧\n• 将出点对齐到最晚的关键帧";
        
        // 绑定事件
        gr.panel1.executeBtn.onClick = function() {
            processSelectedLayers();
        };
        
        gr.panel2.trimInBtn.onClick = function() {
            trimLayerInToFirstKey();
        };
        
        gr.panel2.trimOutBtn.onClick = function() {
            trimLayerOutToLastKey();
        };
        
        return gr;
    }
    
    return {
        name: "TrimPrecomp",
        displayName: "Trim Precomp to Content",
        version: "1.0",
        buildUI: buildUI
    };
})();

// 独立运行模式 - 只在非启动器加载时运行
if (!$.global.DALIMAO_LOADER_ACTIVE) {
    // 确保在独立运行时清除标志（防止残留）
    $.global.DALIMAO_LOADER_ACTIVE = undefined;
    
    (function() {
        var win = new Window("palette", "Trim Precomp to Content by Aite", undefined, {resizeable:true});
        win.alignChildren = ["fill","top"];
        win.spacing = 10;
        win.margins = 16;
        
        TrimPrecompModule.buildUI(win);
        
        win.layout.layout(true);
        win.layout.resize();
        win.onResizing = win.onResize = function () { this.layout.resize(); }
        
        if (win instanceof Window) {
            win.center();
            win.show();
        }
    })();
}
