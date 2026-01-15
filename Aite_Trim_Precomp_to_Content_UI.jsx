/*
    Aite Trim Precomp to Content UI
    功能：根据预合成内部图层的实际内容范围，自动trim预合成图层（浮动面板）
    作者：Aite
    日期：2026-01-09
*/

(function trimPrecompToContentUI() {
    
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
        
        app.beginUndoGroup("Trim Precomp to Content");
        
        var processedCount = 0;
        for (var i = 0; i < precompInfos.length; i++) {
            trimPrecomp(precompInfos[i]);
            processedCount++;
        }
        
        app.endUndoGroup();
    }
    
    // 创建浮动面板UI
    var win = new Window("palette", "Trim Precomp to Content", undefined, {resizeable: true});
    win.orientation = "column";
    win.alignChildren = ["fill", "fill"];
    win.spacing = 10;
    win.margins = 16;
    
    // 说明文本
    var infoPanel = win.add("panel");
    infoPanel.orientation = "column";
    infoPanel.alignChildren = ["left", "top"];
    infoPanel.spacing = 5;
    infoPanel.margins = 10;
    
    infoPanel.add("statictext", undefined, "功能说明：", {multiline: false});
    var desc1 = infoPanel.add("statictext", undefined, "• 选择一个或多个预合成图层", {multiline: false});
    var desc2 = infoPanel.add("statictext", undefined, "• 点击按钮自动trim到内容范围", {multiline: false});
    
    desc1.graphics.font = ScriptUI.newFont(desc1.graphics.font.name, ScriptUI.FontStyle.REGULAR, 10);
    desc2.graphics.font = ScriptUI.newFont(desc2.graphics.font.name, ScriptUI.FontStyle.REGULAR, 10);
    
    // 执行按钮
    var executeBtn = win.add("button", undefined, "Trim 选中的预合成");
    executeBtn.preferredSize = [200, 40];
    executeBtn.alignment = ["center", "center"];
    
    executeBtn.onClick = function() {
        processSelectedLayers();
    };
    
    win.center();
    win.show();
    
})();
