/*
 * Repeater 快捷键脚本 - XY Flip
 * KBar 绑定此文件即可用快捷键触发
 */
(function() {
    var thisComp = app.project.activeItem;
    if (!thisComp || !(thisComp instanceof CompItem)) { alert("请先打开合成"); return; }
    var secL = thisComp.selectedLayers;
    if (secL.length == 0) { alert("请先选择图层"); return; }

    app.beginUndoGroup("XY Flip");
    var createNull = true;
    var compCenter = true;
    var flipScale = false;

    for (var i = 0; i < secL.length; i++) {
        var origLayer = secL[i];
        var origName = origLayer.name;
        var nullName = origName + " XY Flip Ctrl";
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
        dupLayer.name = origName + " [XY Flip]";
        dupLayer.moveBefore(origLayer);

        var pivotExpr;
        if (nullCreated) {
            pivotExpr = "null_p = thisComp.layer(\"" + nullName + "\").position;";
        } else if (compCenter) {
            pivotExpr = "null_p = [thisComp.width/2, thisComp.height/2];";
        } else {
            pivotExpr = "null_p = thisComp.layer(\"" + origName + "\").position;";
        }
        dupLayer.property("Transform").property("Position").expression = "p = thisComp.layer(\"" + origName + "\").position;\n" + pivotExpr + "\n[2*null_p[0]-p[0], 2*null_p[1]-p[1]]";

        if (flipScale) {
            dupLayer.property("Transform").property("Scale").expression = "s = thisComp.layer(\"" + origName + "\").transform.scale;\n[-s[0], -s[1]]";
        } else {
            dupLayer.property("Transform").property("Scale").expression = "thisComp.layer(\"" + origName + "\").transform.scale";
        }
        dupLayer.property("Transform").property("Opacity").expression = "thisComp.layer(\"" + origName + "\").transform.opacity";
        dupLayer.property("Transform").property("Rotation").expression = "-thisComp.layer(\"" + origName + "\").transform.rotation";
    }
    app.endUndoGroup();
})();