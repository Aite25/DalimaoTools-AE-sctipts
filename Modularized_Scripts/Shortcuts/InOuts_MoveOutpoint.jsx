/*
 * 快捷键脚本 - Move OutPoint to Current Time
 * 将选中图层的出点移到当前时间
 */
(function() {
    try {
        var thisComp = app.project.activeItem;
        if (!thisComp) { alert("请先打开合成"); return; }
        var selectedLayers = thisComp.selectedLayers;
        if (selectedLayers.length == 0) { alert("请先选择图层"); return; }

        app.beginUndoGroup("Move OutPoint");
        var time = thisComp.time;
        var minOut = selectedLayers[0].outPoint;
        for (var i = 0; i < selectedLayers.length; i++) {
            if (minOut < selectedLayers[i].outPoint) minOut = selectedLayers[i].outPoint;
        }
        for (var i = 0; i < selectedLayers.length; i++) {
            selectedLayers[i].startTime = selectedLayers[i].startTime + time - minOut;
        }
        app.endUndoGroup();
    } catch(e) {
        alert("Move OutPoint Error:\n" + e.toString());
    }
})();