/*
 * 快捷键脚本 - Move OutPoint to Current Time
 * 模拟 AE 默认 ] 键功能：将选中图层的出点移到当前时间
 */
(function() {
    try {
        var thisComp = app.project.activeItem;
        if (!thisComp) { alert("请先打开合成"); return; }
        var selectedLayers = thisComp.selectedLayers;
        if (selectedLayers.length == 0) { alert("请先选择图层"); return; }

        app.beginUndoGroup("Move OutPoint");
        var time = thisComp.time;
        var fd = thisComp.frameDuration;

        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            // outPoint 是排他性的（指向最后一帧之后），加一帧修正
            var offset = time - layer.outPoint + fd;
            layer.startTime = layer.startTime + offset;
        }
        app.endUndoGroup();
    } catch(e) {
        alert("Move OutPoint Error:\n" + e.toString());
    }
})();