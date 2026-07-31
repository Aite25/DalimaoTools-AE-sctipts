/*
 * 快捷键脚本 - Move InPoint to Current Time
 * 将选中图层的入点移到当前时间
 */
(function() {
    try {
        var thisComp = app.project.activeItem;
        if (!thisComp) return;
        var selectedLayers = thisComp.selectedLayers;
        if (selectedLayers.length == 0) return;

        app.beginUndoGroup("Move InPoint");
        var time = thisComp.time;
        var minIn = selectedLayers[0].inPoint;
        for (var i = 0; i < selectedLayers.length; i++) {
            if (minIn > selectedLayers[i].inPoint) minIn = selectedLayers[i].inPoint;
        }
        for (var i = 0; i < selectedLayers.length; i++) {
            selectedLayers[i].startTime = selectedLayers[i].startTime + time - minIn;
        }
        app.endUndoGroup();
    } catch(e) {}
})();