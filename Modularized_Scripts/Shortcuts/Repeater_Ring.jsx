/*
 * Repeater 快捷键脚本 - Ring
 * KBar 绑定此文件即可用快捷键触发
 * 选中图层后执行，自动创建控制层+副本+计数器
 */
(function() {
    var thisComp = app.project.activeItem;
    if (!thisComp || !(thisComp instanceof CompItem)) { alert("请先打开合成"); return; }
    var secL = thisComp.selectedLayers;
    if (secL.length == 0) { alert("请先选择图层"); return; }

    app.beginUndoGroup("Ring");

    // 默认参数
    var compCenter = true;      // 空对象是否在合成中心
    var allRotation = true;     // 是否影响所有旋转

    for (var i = 0; i < secL.length; i++) {
        var origLayer = secL[i];
        var origName = origLayer.name;
        var ctrlName = origName + " Ring Ctrl";
        var counterName = origName + " Ring Counter";
        var origPos = origLayer.property("Transform").property("Position").value;

        // 1. 控制层空对象（在原图层上方）
        var ctrlNull = thisComp.layers.addNull();
        ctrlNull.name = ctrlName;
        ctrlNull.moveBefore(origLayer);
        ctrlNull.startTime = origLayer.startTime;
        if (compCenter) {
            ctrlNull.property("Transform").property("Position").setValue([thisComp.width/2, thisComp.height/2]);
        } else {
            ctrlNull.property("Transform").property("Position").setValue(origPos);
        }

        // 2. 计数器空对象（在原图层下方）
        var counterNull = thisComp.layers.addNull();
        counterNull.name = counterName;
        counterNull.moveAfter(origLayer);
        counterNull.startTime = origLayer.startTime;
        counterNull.enabled = false;

        // 3. 复制原图层
        var dupLayer = origLayer.duplicate();
        dupLayer.name = origName + " [Ring]";
        dupLayer.moveBefore(origLayer);

        // 4. 控制层: Count 滑块
        var countSlider = ctrlNull.Effects.addProperty("ADBE Slider Control");
        countSlider.name = "Count";
        countSlider(1).expression =
            "thisComp.layer(\"" + counterName + "\").index - thisComp.layer(\"" + ctrlName + "\").index - 1";

        // 5. 控制层: Rotation Delta 滑块
        var rotDeltaSlider = ctrlNull.Effects.addProperty("ADBE Slider Control");
        rotDeltaSlider.name = "Rotation Delta";
        rotDeltaSlider(1).expression =
            "c = effect(\"Count\")(\"Slider\");\nc == 0 ? 0 : 360 / c";

        // 6. 给原图层添加 id 滑块（如果没有）
        var origHasId = false;
        try { origHasId = origLayer.effect("id") != null; } catch(e) {}
        if (!origHasId) {
            var idSliderOrig = origLayer.Effects.addProperty("ADBE Slider Control");
            idSliderOrig.name = "id";
            idSliderOrig(1).expression = "index - thisComp.layer(\"" + ctrlName + "\").index";
        }

        // 7. 副本图层: id + Position + Rotation + Scale + Opacity
        var idSliderDup = dupLayer.Effects.addProperty("ADBE Slider Control");
        idSliderDup.name = "id";
        idSliderDup(1).expression = "index - thisComp.layer(\"" + ctrlName + "\").index";

        dupLayer.property("Transform").property("Position").expression =
            "p = thisComp.layer(\"" + origName + "\").position;\n" +
            "ctrl = thisComp.layer(\"" + ctrlName + "\");\n" +
            "rotDelta = ctrl.effect(\"Rotation Delta\")(\"Slider\");\n" +
            "myId = effect(\"id\")(\"Slider\");\n" +
            "angle = rotDelta * myId * Math.PI / 180;\n" +
            "dx = p[0] - ctrl.position[0];\n" +
            "dy = p[1] - ctrl.position[1];\n" +
            "[ctrl.position[0] + dx*Math.cos(angle) - dy*Math.sin(angle),\n" +
            " ctrl.position[1] + dx*Math.sin(angle) + dy*Math.cos(angle)]";

        if (allRotation) {
            dupLayer.property("Transform").property("Rotation").expression =
                "ctrl = thisComp.layer(\"" + ctrlName + "\");\n" +
                "origLayer = thisComp.layer(\"" + origName + "\");\n" +
                "rotDelta = ctrl.effect(\"Rotation Delta\")(\"Slider\");\n" +
                "myId = effect(\"id\")(\"Slider\");\n" +
                "origLayer.rotation + rotDelta * myId";
        }

        dupLayer.property("Transform").property("Scale").expression =
            "thisComp.layer(\"" + origName + "\").transform.scale";
        dupLayer.property("Transform").property("Opacity").expression =
            "thisComp.layer(\"" + origName + "\").transform.opacity";
    }
    app.endUndoGroup();
})();