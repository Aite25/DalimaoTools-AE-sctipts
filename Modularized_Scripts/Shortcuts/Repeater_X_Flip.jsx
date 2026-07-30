/*
 * Repeater 快捷键脚本 - X Flip
 * KBar 绑定此文件即可用快捷键触发
 * 需要先选中图层再执行
 */
(function() {
    var thisComp = app.project.activeItem;
    if (!thisComp || !(thisComp instanceof CompItem)) { alert("请先打开合成"); return; }
    var secL = thisComp.selectedLayers;
    if (secL.length == 0) { alert("请先选择图层"); return; }

    app.beginUndoGroup("X Flip");

    // 默认参数（可修改）
    var createNull = true;     // 是否创建空对象
    var compCenter = true;     // 空对象是否在合成中心
    var flipScale = false;     // 是否翻转 Scale

    for (var i = 0; i < secL.length; i++) {
        var origLayer = secL[i];
        var origName = origLayer.name;
        var nullName = origName + " X Flip Ctrl";
        var nullCreated = false;

        if (createNull) {
            var nullLayer = thisComp.layers.addNull();
            nullLayer.name = nullName;
            nullLayer.moveBefore(origLayer);
            nullLayer.startTime = origLayer.startTime;
            if (compCenter) {
                nullLayer.property("Transform").property("Position").setValue([thisComp.width / 2, thisComp.height / 2]);
            } else {
                nullLayer.property("Transform").property("Position").setValue(origLayer.property("Transform").property("Position").value);
            }
            nullCreated = true;
        }

        var dupLayer = origLayer.duplicate();
        dupLayer.name = origName + " [X Flip]";
        dupLayer.moveBefore(origLayer);

        var posExpr, pivotExpr;
        if (nullCreated) {
            pivotExpr = "null_p = thisComp.layer(\"" + nullName + "\").position;";
        } else if (compCenter) {
            pivotExpr = "null_p = [thisComp.width/2, thisComp.height/2];";
        } else {
            pivotExpr = "null_p = thisComp.layer(\"" + origName + "\").position;";
        }
        posExpr = "p = thisComp.layer(\"" + origName + "\").position;\n" + pivotExpr + "\n[2*null_p[0]-p[0], p[1]]";
        dupLayer.property("Transform").property("Position").expression = posExpr;

        if (flipScale) {
            dupLayer.property("Transform").property("Scale").expression = "s = thisComp.layer(\"" + origName + "\").transform.scale;\n[-s[0], s[1]]";
        } else {
            dupLayer.property("Transform").property("Scale").expression = "thisComp.layer(\"" + origName + "\").transform.scale";
        }
        dupLayer.property("Transform").property("Opacity").expression = "thisComp.layer(\"" + origName + "\").transform.opacity";
        dupLayer.property("Transform").property("Rotation").expression = "-thisComp.layer(\"" + origName + "\").transform.rotation";
    }

    app.endUndoGroup();
})();