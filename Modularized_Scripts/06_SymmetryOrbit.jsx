/*
 * Symmetry & Orbit - 对称与环绕工具
 * 功能：
 *   1. 点击操作按钮时自动为图层创建空对象并建立父级关系
 *   2. 沿 X 轴 / Y 轴对称复制（表达式绑定）
 *   3. 按指定数量环绕复制（表达式绑定）
 * 使用方式：
 *   选中图层 -> 直接点击对称/环绕按钮即可
 *   空对象自动建立在合成中心，图层与空对象的偏移即为对称/环绕半径
 * Author: Aite
 * Version: 1.2
 */

var SymmetryOrbitModule = (function() {

    var scriptName = "Symmetry & Orbit";

    // 打在空对象 marker 上的专属标识（comment 字段），用于识别是否已建立过中心空对象
    var MARKER_TAG = "Symmetry_Center";

    // 检查指定图层的 marker 中是否含有脚本标识
    function hasOrbitMarker(layer) {
        try {
            var markerProp = layer.property("Marker");
            for (var i = 1; i <= markerProp.numKeys; i++) {
                if (markerProp.keyValue(i).comment === MARKER_TAG) {
                    return true;
                }
            }
        } catch(e) {}
        return false;
    }

    // =====================================================
    //  建立空对象父级
    //  - 空对象建立在合成中心（无父级时）或父级原点（有父级时）
    //  - 图层的父级改为空对象，视觉位置保持不变
    //  - 图层与空对象的偏移即为对称/环绕的半径
    // =====================================================
    function setupNull(comp, layer, useCompCenter) {
        // 若图层父级上已有脚本专属 marker，说明中心空对象已建立，直接复用
        if (layer.parent && hasOrbitMarker(layer.parent)) {
            return layer.parent;
        }

        var originalParent = layer.parent;
        var layerPos = layer.transform.position.value;

        var nullLayer = comp.layers.addNull();
        nullLayer.name = layer.name + "_Center";
        nullLayer.label = layer.label;

        var nullPos;

        if (useCompCenter) {
            // 勾选「合成中心」：空对象放在合成中心（有父级时放在父级原点）
            if (originalParent) {
                nullLayer.parent = originalParent;
                nullPos = (layerPos.length >= 3) ? [0, 0, 0] : [0, 0];
            } else {
                nullPos = [comp.width / 2, comp.height / 2];
            }
            nullLayer.transform.position.setValue(nullPos);
        } else {
            // 未勾选（默认）：空对象副本放在图层当前位置，图层相对偏移为 [0,0]
            if (originalParent) {
                nullLayer.parent = originalParent;
            }
            nullLayer.transform.position.setValue(layerPos);
            nullPos = layerPos;
        }

        // 计算图层相对空对象的本地坐标，保持视觉位置不变
        var newLocalPos;
        if (layerPos.length >= 3) {
            newLocalPos = [layerPos[0] - nullPos[0], layerPos[1] - nullPos[1], layerPos[2] - (nullPos[2] || 0)];
        } else {
            newLocalPos = [layerPos[0] - nullPos[0], layerPos[1] - nullPos[1]];
        }

        layer.parent = nullLayer;
        layer.transform.position.setValue(newLocalPos);

        // 在空对象上打上脚本专属 marker，标识该空对象为中心节点
        // MarkerValue 第一个参数即 comment，使用 inPoint 作为时间确保在图层范围内
        try {
            var mv = new MarkerValue(MARKER_TAG);
            mv.duration = 0;
            nullLayer.property("Marker").setValueAtTime(nullLayer.inPoint, mv);
        } catch(e) {}

        return nullLayer;
    }

    // =====================================================
    //  对称复制（表达式绑定）
    //  axisMode: "X" = 沿X轴对称（Y取反），"Y" = 沿Y轴对称（X取反）
    // =====================================================
    // opts: { pos: bool, rot: bool, scl: bool }
    function mirrorLayer(comp, layer, axisMode, useCompCenter, opts) {
        setupNull(comp, layer, useCompCenter);

        var origName = layer.name;
        var nullParent = layer.parent;

        var copyLayer = layer.duplicate();
        copyLayer.name = origName + (axisMode === "X" ? "_MirrorX" : axisMode === "Y" ? "_MirrorY" : "_MirrorXY");
        copyLayer.parent = nullParent;

        try { copyLayer.transform.position.expression = ""; } catch(e){}
        try { copyLayer.transform.scale.expression = ""; } catch(e){}
        try { copyLayer.transform.rotation.expression = ""; } catch(e){}
        try { copyLayer.transform.opacity.expression = ""; } catch(e){}

        var ref = 'var orig = thisComp.layer("' + origName + '");\n';

        if (axisMode === "X") {
            if (opts.pos) copyLayer.transform.position.expression = ref +
                'var p = orig.transform.position.value;\n[p[0], -p[1]];';
            if (opts.scl) copyLayer.transform.scale.expression = ref +
                'var s = orig.transform.scale.value;\n[s[0], -s[1]];';
            if (opts.rot) copyLayer.transform.rotation.expression = ref +
                '-orig.transform.rotation.value;';
        } else if (axisMode === "Y") {
            if (opts.pos) copyLayer.transform.position.expression = ref +
                'var p = orig.transform.position.value;\n[-p[0], p[1]];';
            if (opts.scl) copyLayer.transform.scale.expression = ref +
                'var s = orig.transform.scale.value;\n[-s[0], s[1]];';
            if (opts.rot) copyLayer.transform.rotation.expression = ref +
                '-orig.transform.rotation.value;';
        } else { // XY
            if (opts.pos) copyLayer.transform.position.expression = ref +
                'var p = orig.transform.position.value;\n[-p[0], -p[1]];';
            if (opts.scl) copyLayer.transform.scale.expression = ref +
                'var s = orig.transform.scale.value;\n[-s[0], -s[1]];';
            if (opts.rot) copyLayer.transform.rotation.expression = ref +
                'orig.transform.rotation.value;';
        }
        copyLayer.transform.opacity.expression = ref + 'orig.transform.opacity.value;';

        return copyLayer;
    }

    // =====================================================
    //  环绕复制（表达式绑定）
    //  count: 总数量（含原图层），每份间隔 360/count 度
    // =====================================================
    // opts: { pos: bool, rot: bool, scl: bool }
    function orbitLayers(comp, layer, count, useCompCenter, opts) {
        if (count < 2) { alert("环绕数量至少为 2。"); return; }

        setupNull(comp, layer, useCompCenter);

        var origName = layer.name;
        var nullParent = layer.parent;

        for (var i = 1; i < count; i++) {
            var copyLayer = layer.duplicate();
            copyLayer.name = origName + "_Orbit" + i;
            copyLayer.parent = nullParent;

            try { copyLayer.transform.position.expression = ""; } catch(e){}
            try { copyLayer.transform.scale.expression = ""; } catch(e){}
            try { copyLayer.transform.rotation.expression = ""; } catch(e){}
            try { copyLayer.transform.opacity.expression = ""; } catch(e){}

            var ref = 'var orig = thisComp.layer("' + origName + '");\n';
            var N = count, idx = i;

            if (opts.pos) copyLayer.transform.position.expression = ref +
                'var p = orig.transform.position.value;\n' +
                'var deg = (Math.PI * 2 / ' + N + ') * ' + idx + ';\n' +
                'var c = Math.cos(deg), s = Math.sin(deg);\n' +
                '[p[0]*c - p[1]*s, p[0]*s + p[1]*c];';

            if (opts.rot) copyLayer.transform.rotation.expression = ref +
                'orig.transform.rotation.value + (360 / ' + N + ') * ' + idx + ';';

            if (opts.scl) copyLayer.transform.scale.expression = ref + 'orig.transform.scale.value;';
            copyLayer.transform.opacity.expression = ref + 'orig.transform.opacity.value;';
        }
    }

    // =====================================================
    //  UI
    // =====================================================
    function buildUI(container) {
        var ui_res =
        "group { orientation:'column', alignment:['fill','fill'], alignChildren:['fill','top'], spacing:6, \
            panelMirror: Panel { text:'\u5bf9\u79f0\u590d\u5236', orientation:'column', alignChildren:['fill','top'], spacing:4, \
                chkCenter: Checkbox { text:'\u5728\u5408\u6210\u4e2d\u5fc3\u5efa\u7a7a\u5bf9\u8c61', value:false } \
                grExpr: Group { orientation:'row', alignChildren:['left','center'], spacing:6, \
                    chkPos: Checkbox { text:'Pos', value:true } \
                    chkRot: Checkbox { text:'Rot', value:true } \
                    chkScl: Checkbox { text:'Scl', value:true } \
                }, \
                grMirror: Group { orientation:'row', alignChildren:['left','center'], spacing:4, \
                    btnMirrorY: Button { text:'X <>', preferredSize:[40,20] } \
                    btnMirrorX: Button { text:'Y \u2195', preferredSize:[40,20] } \
                    btnMirrorXY: Button { text:'XY \u2715', preferredSize:[40,20] } \
                }, \
            }, \
            panelOrbit: Panel { text:'\u73af\u7ed5\u590d\u5236', orientation:'row', alignChildren:['center','center'], spacing:4, \
                lblCount: StaticText { text:'\u6570\u91cf', preferredSize:[28,20] } \
                editCount: EditText { text:'4', preferredSize:[25,20] } \
                sldCount: Slider { minvalue:1, maxvalue:12, value:4, preferredSize:[-1,17], alignment:['fill','center'] } \
                btnOrbit: Button { text:'Ring \u274b', preferredSize:[50,20] } \
            }, \
            grStatus: Group { orientation:'row', alignChildren:['left','center'], \
                txtStatus: StaticText { text:'\u5c31\u7eea', characters:44 } \
            }, \
        }";

        var gr = container.add(ui_res);
        var txtStatus = gr.grStatus.txtStatus;
        var editCount = gr.panelOrbit.editCount;
        var sldCount  = gr.panelOrbit.sldCount;
        var chkCenter = gr.panelMirror.chkCenter;
        var chkPos    = gr.panelMirror.grExpr.chkPos;
        var chkRot    = gr.panelMirror.grExpr.chkRot;
        var chkScl    = gr.panelMirror.grExpr.chkScl;

        // —— 滑块 <-> EditText 双向绑定 ——
        // 滑块变化 → 更新 EditText（整数）
        sldCount.onChanging = function() {
            var v = Math.round(sldCount.value);
            sldCount.value = v;
            editCount.text = String(v);
        };
        // EditText 失焦/回车 → 更新滑块（超出范围时滑块夹在边界）
        editCount.onChange = function() {
            var v = parseInt(editCount.text, 10);
            if (isNaN(v) || v < 1) { v = 1; editCount.text = "1"; }
            // 滑块只能在 [1,12] 内移动，数值可超出 12
            sldCount.value = Math.min(Math.max(v, sldCount.minvalue), sldCount.maxvalue);
        };

        function setStatus(msg) { txtStatus.text = msg; }

        function getCtx() {
            var comp = app.project.activeItem;
            if (!comp || !(comp instanceof CompItem)) { setStatus("错误：请先打开一个合成"); return null; }
            var sel = [];
            for (var i = 0; i < comp.selectedLayers.length; i++) sel.push(comp.selectedLayers[i]);
            if (sel.length === 0) { setStatus("错误：请先选择图层"); return null; }
            return { comp: comp, sel: sel };
        }

        // 恢复原始选中状态：先全部取消选择，再重新选中传入的图层数组
        function restoreSelection(comp, layers) {
            try {
                for (var i = 1; i <= comp.numLayers; i++) {
                    comp.layer(i).selected = false;
                }
                for (var j = 0; j < layers.length; j++) {
                    layers[j].selected = true;
                }
            } catch(e) {}
        }

        gr.panelMirror.grMirror.btnMirrorX.onClick = function() {
            var ctx = getCtx(); if (!ctx) return;
            var useCC = chkCenter.value;
            var opts = { pos: chkPos.value, rot: chkRot.value, scl: chkScl.value };
            app.beginUndoGroup(scriptName + " - Mirror Y");
            try {
                for (var i = 0; i < ctx.sel.length; i++) mirrorLayer(ctx.comp, ctx.sel[i], "X", useCC, opts);
                restoreSelection(ctx.comp, ctx.sel);
                setStatus("完成：生成了 " + ctx.sel.length + " 个 Y\u2195 副本");
            } catch(e) { setStatus("错误：" + e.toString()); }
            app.endUndoGroup();
        };

        gr.panelMirror.grMirror.btnMirrorY.onClick = function() {
            var ctx = getCtx(); if (!ctx) return;
            var useCC = chkCenter.value;
            var opts = { pos: chkPos.value, rot: chkRot.value, scl: chkScl.value };
            app.beginUndoGroup(scriptName + " - Mirror X");
            try {
                for (var i = 0; i < ctx.sel.length; i++) mirrorLayer(ctx.comp, ctx.sel[i], "Y", useCC, opts);
                restoreSelection(ctx.comp, ctx.sel);
                setStatus("完成：生成了 " + ctx.sel.length + " 个 X<> 副本");
            } catch(e) { setStatus("错误：" + e.toString()); }
            app.endUndoGroup();
        };

        gr.panelMirror.grMirror.btnMirrorXY.onClick = function() {
            var ctx = getCtx(); if (!ctx) return;
            var useCC = chkCenter.value;
            var opts = { pos: chkPos.value, rot: chkRot.value, scl: chkScl.value };
            app.beginUndoGroup(scriptName + " - Mirror XY");
            try {
                for (var i = 0; i < ctx.sel.length; i++) mirrorLayer(ctx.comp, ctx.sel[i], "XY", useCC, opts);
                restoreSelection(ctx.comp, ctx.sel);
                setStatus("完成：生成了 " + ctx.sel.length + " 个 XY\u2715 副本");
            } catch(e) { setStatus("错误：" + e.toString()); }
            app.endUndoGroup();
        };

        gr.panelOrbit.btnOrbit.onClick = function() {
            var ctx = getCtx(); if (!ctx) return;
            var useCC = chkCenter.value;
            var opts = { pos: chkPos.value, rot: chkRot.value, scl: chkScl.value };
            var countVal = parseInt(editCount.text, 10);
            if (isNaN(countVal) || countVal < 2) { setStatus("错误：总数量请填 >= 2 的整数"); return; }
            app.beginUndoGroup(scriptName + " - Orbit");
            try {
                for (var i = 0; i < ctx.sel.length; i++) orbitLayers(ctx.comp, ctx.sel[i], countVal, useCC, opts);
                restoreSelection(ctx.comp, ctx.sel);
                setStatus("完成：每个图层生成了 " + (countVal - 1) + " 个环绕副本");
            } catch(e) { setStatus("错误：" + e.toString()); }
            app.endUndoGroup();
        };

        return gr;
    }

    return {
        name: "SymmetryOrbit",
        displayName: "Symmetry & Orbit",
        version: "1.2",
        author: "Aite",
        description: "自动建立空对象，通过表达式绑定实现对称/环绕复制",
        buildUI: buildUI
    };

})();

// ==== 独立运行 / 启动器两种模式 ====
if ($.global.DALIMAO_LOADER_ACTIVE) {
    $.global.DALIMAO_REGISTER(SymmetryOrbitModule);
} else {
    (function() {
        var win = new Window("palette", "对称 & 环绕 by Aite", undefined, {resizeable: true});
        win.alignChildren = ["fill", "top"];
        win.spacing = 10;
        win.margins = 10;
        SymmetryOrbitModule.buildUI(win);
        win.layout.layout(true);
        win.layout.resize();
        win.onResizing = win.onResize = function() { this.layout.resize(); };
        if (win instanceof Window) { win.center(); win.show(); }
    })();
}
