/*
 * 模块名称: InOuts
 * 功能描述: 图层出入点、裁剪、延伸工具
 * 版本: 1.0.0
 * 作者: Dalimao Tools (原 Aite_inOuts)
 */

var InOutsModule = (function() {
    var moduleObj = {
        name: "InOuts",
        displayName: "InOuts",
        version: "1.0.0",

        buildUI: function(container) {
            var scriptName = "InOuts";

            // ---- 功能函数 ----

            function inOutsRelatoKeys(type) {
                var thisComp = app.project.activeItem;
                var secL = thisComp.selectedLayers;
                var secP = thisComp.selectedProperties;

                var secLlenArr = [];
                secLlenArr.length = secL.length;
                var laySelInd;

                for (var i = 0; i < secP.length; i++) {
                    if (secP[i].canSetExpression != 1) continue;
                    var curLayer = secP[i].propertyGroup(secP[i].propertyDepth);
                    for (var j = 0; j < secL.length; j++) {
                        if (curLayer == secL[j]) { laySelInd = j; break; }
                    }
                    var inP = secP[i].keyTime(1);
                    var ouP = secP[i].keyTime(secP[i].numKeys) + thisComp.frameDuration;

                    if (secLlenArr[laySelInd] == undefined) {
                        secLlenArr[laySelInd] = [curLayer, inP, ouP];
                        continue;
                    }
                    if (secLlenArr[laySelInd][1] > inP) secLlenArr[laySelInd][1] = inP;
                    if (secLlenArr[laySelInd][2] < inP) secLlenArr[laySelInd][2] = ouP;
                }

                for (var i = 0; i < secLlenArr.length; i++) {
                    if (!secLlenArr[i]) continue;
                    if (type == 0) {
                        var layerlengthdel = secLlenArr[i][1] - secLlenArr[i][0].inPoint + thisComp.frameDuration;
                        secLlenArr[i][0].inPoint = secLlenArr[i][1];
                        secLlenArr[i][0].outPoint = secLlenArr[i][0].outPoint + layerlengthdel;
                    } else if (type == 1) {
                        secLlenArr[i][0].inPoint = secLlenArr[i][1];
                        secLlenArr[i][0].outPoint = secLlenArr[i][2];
                    } else if (type == 2) {
                        secLlenArr[i][0].outPoint = secLlenArr[i][2];
                    }
                }
            }

            function layerCut(inType) {
                var time = app.project.activeItem.time;
                var selectedLayers = app.project.activeItem.selectedLayers;
                if (inType == 0) {
                    for (var i = 0; i < selectedLayers.length; i++) {
                        if (selectedLayers[i].inPoint < time && selectedLayers[i].outPoint > time) {
                            var outPointSave = selectedLayers[i].outPoint;
                            selectedLayers[i].inPoint = time;
                            selectedLayers[i].outPoint = outPointSave;
                        }
                    }
                } else if (inType == 1) {
                    for (var i = 0; i < selectedLayers.length; i++) {
                        if (selectedLayers[i].inPoint < time && selectedLayers[i].outPoint > time) {
                            selectedLayers[i].outPoint = time + app.project.activeItem.frameDuration;
                        }
                    }
                }
            }

            function layerMove(inType) {
                var time = app.project.activeItem.time;
                var selectedLayers = app.project.activeItem.selectedLayers;
                var a = (inType == 0) ? 'inPoint' : 'outPoint';
                var minIn = selectedLayers[0][a];
                for (var i = 0; i < selectedLayers.length; i++) {
                    if (inType ^ (minIn > selectedLayers[i][a])) minIn = selectedLayers[i][a];
                }
                for (var i = 0; i < selectedLayers.length; i++) {
                    selectedLayers[i].startTime = selectedLayers[i].startTime + time - minIn;
                }
            }

            function layerExtend(type) {
                var thisComp = app.project.activeItem;
                var secL = thisComp.selectedLayers;
                var time = thisComp.time;

                for (var i = 0; i < secL.length; i++) {
                    if (type == 0) {
                        if (secL[i].inPoint > time || secL[i].outPoint < time) {
                            var layerOutPointSave = secL[i].outPoint;
                            secL[i].inPoint = 0;
                            secL[i].outPoint = layerOutPointSave;
                        }
                    } else if (type == 2) {
                        if (secL[i].inPoint > time || secL[i].outPoint < time) {
                            secL[i].outPoint = thisComp.duration;
                        }
                    } else {
                        if (secL[i].inPoint > time || secL[i].outPoint < time) {
                            secL[i].inPoint = 0;
                            secL[i].outPoint = thisComp.duration;
                        }
                    }
                }
            }

            // ---- UI ----
            var grp = container.add("group { orientation:'column', alignment:['fill','fill'], alignChildren:['left','top'] }");

            // 行1: 移动 / 关键帧对齐
            var gr1 = grp.add("group { orientation:'row', alignment:['fill','top'] }");
            var leftMoveBtn = gr1.add("button", undefined, "[");
            leftMoveBtn.preferredSize = [30, 20];
            var rightMoveBtn = gr1.add("button", undefined, "]");
            rightMoveBtn.preferredSize = [30, 20];
            var leftKeyMoveBtn = gr1.add("button", undefined, "|\u2190\u25C6");
            leftKeyMoveBtn.preferredSize = [40, 20];
            var rightKeyMoveBtn = gr1.add("button", undefined, "\u25C6\u2192|");
            rightKeyMoveBtn.preferredSize = [40, 20];
            var inOutsRelatoKeysBtn = gr1.add("button", undefined, "|\u2190\u25C6\u2192|");
            inOutsRelatoKeysBtn.preferredSize = [60, 20];

            // 行2: 裁剪 / 延伸
            var gr2 = grp.add("group { orientation:'row', alignment:['fill','top'] }");
            var leftCutBtn = gr2.add("button", undefined, "[/=]");
            leftCutBtn.preferredSize = [30, 20];
            var rightCutBtn = gr2.add("button", undefined, "[=/]");
            rightCutBtn.preferredSize = [30, 20];
            var leftExtendBtn = gr2.add("button", undefined, "|\u2190[==]");
            leftExtendBtn.preferredSize = [40, 20];
            var rightExtendBtn = gr2.add("button", undefined, "[==]\u2192|");
            rightExtendBtn.preferredSize = [40, 20];
            var layerExtendBtn = gr2.add("button", undefined, "|\u2190[==]\u2192|");
            layerExtendBtn.preferredSize = [60, 20];

            // ---- 事件绑定 ----
            leftMoveBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                layerMove(0);
                app.endUndoGroup();
            };
            rightMoveBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                layerMove(1);
                app.endUndoGroup();
            };
            leftCutBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                layerCut(0);
                app.endUndoGroup();
            };
            rightCutBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                layerCut(1);
                app.endUndoGroup();
            };
            leftExtendBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                layerExtend(0);
                app.endUndoGroup();
            };
            rightExtendBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                layerExtend(2);
                app.endUndoGroup();
            };
            layerExtendBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                layerExtend(1);
                app.endUndoGroup();
            };
            leftKeyMoveBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                inOutsRelatoKeys(0);
                app.endUndoGroup();
            };
            rightKeyMoveBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                inOutsRelatoKeys(2);
                app.endUndoGroup();
            };
            inOutsRelatoKeysBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                inOutsRelatoKeys(1);
                app.endUndoGroup();
            };

            return grp;
        }
    };

    return moduleObj;
})();

// ==== 独立运行 / 启动器两种模式 ====
if ($.global.DALIMAO_LOADER_ACTIVE) {
    $.global.DALIMAO_REGISTER(InOutsModule);
} else {
    (function() {
        var win = new Window("palette", "InOuts by \u5927\u72f8\u732b", undefined, {resizeable: true});
        win.alignChildren = ["fill", "top"];
        win.spacing = 10;
        win.margins = 10;

        InOutsModule.buildUI(win);

        win.layout.layout(true);
        win.layout.resize();
        win.onResizing = win.onResize = function() { this.layout.resize(); };

        if (win instanceof Window) {
            win.center();
            win.show();
        }
    })();
}